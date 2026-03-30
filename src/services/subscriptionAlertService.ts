import { UserService } from './userService';
import type { User as UserModel } from '@/types/models';

export interface SubscriptionAlert {
  userId: string;
  userName: string;
  userEmail: string;
  subscriptionEndDate: Date;
  renewalReminderDate: Date | null;
  daysUntilExpiry: number;
  daysUntilReminder: number | null;
  alertType: 'expiry' | 'reminder' | 'both';
  severity: 'warning' | 'critical';
}

export class SubscriptionAlertService {
  private userService: UserService;
  private alertThreshold = 3; // أيام قبل انتهاء الاشتراك
  private reminderThreshold = 1; // أيام قبل إرسال التذكير
  private static soundPlayed = false; // منع تشغيل الصوت المتكرر
  private static lastSoundTime = 0; // آخر مرة تم تشغيل الصوت
  private static inFlight: Promise<SubscriptionAlert[]> | null = null;
  private static cache: { alerts: SubscriptionAlert[]; fetchedAt: number } | null = null;

  constructor() {
    this.userService = new UserService();
    this.loadSettings();
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    // تحميل الإعدادات من localStorage
    const savedAlertThreshold = localStorage.getItem('subscription-alert-threshold');
    const savedReminderThreshold = localStorage.getItem('subscription-alert-reminder-threshold');
    
    if (savedAlertThreshold) {
      this.alertThreshold = parseInt(savedAlertThreshold);
    }
    if (savedReminderThreshold) {
      this.reminderThreshold = parseInt(savedReminderThreshold);
    }
  }

  /**
   * فحص جميع المستخدمين وإرجاع التحذيرات
   */
  async getSubscriptionAlerts(options?: { force?: boolean }): Promise<SubscriptionAlert[]> {
    const force = options?.force === true;
    const cached = SubscriptionAlertService.cache;
    // Cache is session-sticky by default (fetch once per page load).
    if (!force && cached) return cached.alerts;
    if (SubscriptionAlertService.inFlight) {
      return SubscriptionAlertService.inFlight;
    }

    SubscriptionAlertService.inFlight = (async () => {
    try {
      const users = await this.userService.getUsers({});
      const usersArray = Array.isArray(users) ? users : (users as any)?.data || [];
      
      const alerts: SubscriptionAlert[] = [];
      const now = new Date();
      
      for (const user of usersArray) {
        const alert = this.checkUserSubscription(user, now);
        if (alert) {
          alerts.push(alert);
        }
      }
      
      // ترتيب التحذيرات حسب الأولوية
      const sorted = alerts.sort((a, b) => {
        if (a.severity === 'critical' && b.severity !== 'critical') return -1;
        if (b.severity === 'critical' && a.severity !== 'critical') return 1;
        return a.daysUntilExpiry - b.daysUntilExpiry;
      });
      SubscriptionAlertService.cache = { alerts: sorted, fetchedAt: Date.now() };
      return sorted;
    } catch (error) {
      console.error('Error fetching subscription alerts:', error);
      return [];
    } finally {
      SubscriptionAlertService.inFlight = null;
    }
    })();

    return SubscriptionAlertService.inFlight;
  }

  /**
   * Clear cached alerts (next call will refetch).
   */
  clearCache(): void {
    SubscriptionAlertService.cache = null;
  }

  /**
   * فحص مستخدم واحد وإرجاع التحذير إذا كان مطلوباً
   */
  private checkUserSubscription(user: UserModel, now: Date): SubscriptionAlert | null {
    const subscriptionEndDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const renewalReminderDate = user.subscriptionRenewalReminderSent ? new Date(user.subscriptionRenewalReminderSent) : null;
    
    if (!subscriptionEndDate) return null;
    
    const daysUntilExpiry = Math.ceil((subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilReminder = renewalReminderDate ? 
      Math.ceil((renewalReminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    // تحديد نوع التحذير
    let alertType: 'expiry' | 'reminder' | 'both' = 'expiry';
    let severity: 'warning' | 'critical' = 'warning';
    
    if (daysUntilExpiry <= 0) {
      severity = 'critical';
    } else if (daysUntilExpiry <= this.alertThreshold) {
      severity = 'critical';
    } else if (daysUntilExpiry <= this.alertThreshold * 2) {
      severity = 'warning';
    } else {
      return null; // لا يوجد تحذير
    }
    
    // فحص التذكير
    if (renewalReminderDate && daysUntilReminder !== null && daysUntilReminder <= this.reminderThreshold) {
      if (alertType === 'expiry') {
        alertType = 'both';
      } else {
        alertType = 'reminder';
      }
    }
    
    return {
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      subscriptionEndDate,
      renewalReminderDate,
      daysUntilExpiry,
      daysUntilReminder,
      alertType,
      severity
    };
  }

  /**
   * الحصول على عدد التحذيرات الإجمالي
   */
  async getAlertCount(): Promise<number> {
    const alerts = await this.getSubscriptionAlerts();
    return alerts.length;
  }

  /**
   * الحصول على عدد التحذيرات الحرجة
   */
  async getCriticalAlertCount(): Promise<number> {
    const alerts = await this.getSubscriptionAlerts();
    return alerts.filter(alert => alert.severity === 'critical').length;
  }

  /**
   * تشغيل التحذير الصوتي
   */
  playAlertSound(): void {
    const now = Date.now();
    const timeSinceLastSound = now - SubscriptionAlertService.lastSoundTime;
    
    // منع تشغيل الصوت إذا تم تشغيله خلال آخر 5 ثوان
    if (timeSinceLastSound < 5000) {
      return;
    }
    
    // منع تشغيل الصوت إذا تم تشغيله بالفعل في هذه الجلسة
    if (SubscriptionAlertService.soundPlayed) {
      return;
    }
    
    try {
      // إنشاء صوت تحذير بسيط
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // تحديث الوقت الأخير وتأكيد التشغيل
      SubscriptionAlertService.lastSoundTime = now;
      SubscriptionAlertService.soundPlayed = true;
      
      // إعادة تعيين الحالة بعد 30 ثانية
      setTimeout(() => {
        SubscriptionAlertService.soundPlayed = false;
      }, 30000);
      
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  }

  /**
   * إرسال إشعار للمتصفح
   */
  async showBrowserNotification(alert: SubscriptionAlert): Promise<void> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(
        `تحذير اشتراك - ${alert.userName}`,
        {
          body: alert.alertType === 'expiry' 
            ? (alert.daysUntilExpiry <= 0 ? 'انتهى الاشتراك' : `الاشتراك سينتهي خلال ${alert.daysUntilExpiry} أيام`)
            : `يجب إرسال تذكير التجديد خلال ${alert.daysUntilReminder} أيام`,
          icon: '/favicon.ico',
          tag: `subscription-alert-${alert.userId}`,
          requireInteraction: true
        }
      );

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showBrowserNotification(alert);
      }
    }
  }

  /**
   * طلب إذن الإشعارات
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * إرسال جميع التحذيرات كإشعارات
   */
  async sendAllAlertsAsNotifications(): Promise<void> {
    const alerts = await this.getSubscriptionAlerts();
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    
    for (const alert of criticalAlerts) {
      await this.showBrowserNotification(alert);
      // تأخير قصير بين الإشعارات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * إعادة تعيين حالة الصوت
   */
  resetSoundState(): void {
    SubscriptionAlertService.soundPlayed = false;
    SubscriptionAlertService.lastSoundTime = 0;
  }

  /**
   * فحص ما إذا كان يمكن تشغيل الصوت
   */
  canPlaySound(): boolean {
    const now = Date.now();
    const timeSinceLastSound = now - SubscriptionAlertService.lastSoundTime;
    return timeSinceLastSound >= 5000 && !SubscriptionAlertService.soundPlayed;
  }
}

let _subscriptionAlertService: SubscriptionAlertService | null = null;
export function getSubscriptionAlertService(): SubscriptionAlertService {
  if (!_subscriptionAlertService) {
    _subscriptionAlertService = new SubscriptionAlertService();
  }
  return _subscriptionAlertService;
}
