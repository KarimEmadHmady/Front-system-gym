// 'use client';

// import React, { useState, useEffect, useRef, use } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { useRouter } from '@/i18n/navigation';
// import { ArrowLeft, ArrowRight } from 'lucide-react';
// // Simple UI components
// const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
//   <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}>
//     {children}
//   </div>
// );

// const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
//   <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
//     {children}
//   </div>
// );

// const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
//   <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
//     {children}
//   </h3>
// );

// const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
//   <div className={`p-6 ${className}`}>
//     {children}
//   </div>
// );

// const Button = ({ children, onClick, disabled = false, className = '', variant = 'default' }: { 
//   children: React.ReactNode; 
//   onClick?: () => void; 
//   disabled?: boolean; 
//   className?: string;
//   variant?: 'default' | 'outline' | 'destructive';
// }) => {
//   const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
//   const variantClasses = {
//     default: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
//     outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
//     destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
//   };
  
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
//     >
//       {children}
//     </button>
//   );
// };

// const Input = ({ value, onChange, placeholder, className = '', type = 'text', disabled = false, onKeyPress }: {
//   value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   placeholder?: string;
//   className?: string;
//   type?: string;
//   disabled?: boolean;
//   onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
// }) => (
//   <input
//     type={type}
//     value={value}
//     onChange={onChange}
//     onKeyPress={onKeyPress}
//     placeholder={placeholder}
//     disabled={disabled}
//     className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${disabled ? 'bg-gray-100 dark:bg-gray-600' : ''} ${className}`}
//   />
// );

// const Badge = ({ children, variant = 'default', className = '' }: { 
//   children: React.ReactNode; 
//   variant?: 'default' | 'secondary' | 'destructive' | 'outline';
//   className?: string;
// }) => {
//   const variantClasses = {
//     default: 'bg-gray-100 text-gray-800',
//     secondary: 'bg-gray-100 text-gray-800',
//     destructive: 'bg-red-100 text-red-800',
//     outline: 'border border-gray-300 text-gray-700'
//   };
  
//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
//       {children}
//     </span>
//   );
// };

// const Alert = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
//   <div className={`p-4 rounded-md ${className}`}>
//     {children}
//   </div>
// );

// const AlertDescription = ({ children }: { children: React.ReactNode }) => (
//   <div className="text-sm">
//     {children}
//   </div>
// );

// // Popup Modal Component
// const PopupModal = ({ 
//   isOpen, 
//   onClose, 
//   title, 
//   message, 
//   type = 'success',
//   data 
// }: { 
//   isOpen: boolean; 
//   onClose: () => void; 
//   title: string; 
//   message: string; 
//   type?: 'success' | 'error' | 'warning';
//   data?: any;
// }) => {
//   if (!isOpen) return null;

//   const getIcon = () => {
//     switch (type) {
//       case 'success':
//         return <CheckCircle className="h-8 w-8 text-green-500" />;
//       case 'error':
//         return <XCircle className="h-8 w-8 text-red-500" />;
//       case 'warning':
//         return <Clock className="h-8 w-8 text-gray-500" />;
//       default:
//         return <CheckCircle className="h-8 w-8 text-gray-500" />;
//     }
//   };

//   const getBgColor = () => {
//     switch (type) {
//       case 'success':
//         return 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400';
//       case 'error':
//         return 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400';
//       case 'warning':
//         return 'bg-gray-50 dark:bg-gray-900/20 border-gray-500 dark:border-gray-400';
//       default:
//         return 'bg-gray-50 dark:bg-gray-900/20 border-gray-500 dark:border-gray-400';
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* Backdrop */}
//       <div 
//         className="absolute inset-0 bg-black/70 bg-opacity-50" 
//         onClick={onClose}
//       />
      
//       {/* Modal */}
//       <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 max-w-md w-full mx-4 ${getBgColor()}`}>
//         <div className="p-6">
//           <div className="flex items-center justify-center mb-4">
//             {getIcon()}
//           </div>
          
//           <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
//             {title}
//           </h3>
          
//           <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
//             {message}
//           </p>
          
//           {data && (
//             <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
//               <div className="text-sm text-gray-700 dark:text-gray-300">
//                 <p><strong>العضو:</strong> {data.user.name}</p>
//                 <p><strong>الباركود:</strong> {data.user.barcode}</p>
//                 <p><strong>الوقت:</strong> {new Date(data.attendance.time).toLocaleTimeString('ar-SA', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                   second: '2-digit'
//                 })}</p>
//               </div>
//             </div>
//           )}
          
//           <div className="flex justify-center">
//             <Button
//               onClick={onClose}
//               className="px-6 py-2"
//             >
//               موافق
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// import { CheckCircle, XCircle, Clock, User, Calendar, QrCode, Scan, Camera } from 'lucide-react';
// // Sound effects
// const playSound = (type: 'success' | 'error' | 'warning') => {
//   const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
//   const oscillator = audioContext.createOscillator();
//   const gainNode = audioContext.createGain();
  
//   oscillator.connect(gainNode);
//   gainNode.connect(audioContext.destination);
  
//   switch (type) {
//     case 'success':
//       // Success sound - ascending tone
//       oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
//       oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
//       oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
//       gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
//       gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
//       oscillator.start(audioContext.currentTime);
//       oscillator.stop(audioContext.currentTime + 0.3);
//       break;
//     case 'error':
//       // Error sound - descending tone
//       oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
//       oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
//       oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
//       gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
//       gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
//       oscillator.start(audioContext.currentTime);
//       oscillator.stop(audioContext.currentTime + 0.3);
//       break;
//     case 'warning':
//       // Warning sound - short beep
//       oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
//       gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
//       gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
//       oscillator.start(audioContext.currentTime);
//       oscillator.stop(audioContext.currentTime + 0.2);
//       break;
//   }
// };

// import QRCodeScanner from '@/components/admin/QRCodeScanner';
// import { attendanceScanService } from '@/services/membershipCardService';
// import { queueAttendance } from '@/lib/offlineSync';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';

// interface AttendanceResult {
//   success: boolean;
//   message: string;
//   data?: {
//     user: {
//       id: string;
//       name: string;
//       barcode: string;
//       email: string;
//       membershipLevel: string;
//     };
//     attendance: {
//       id: string;
//       date: string;
//       status: string;
//       time: string;
//     };
//   };
// }

// interface TodaySummary {
//   summary: {
//     date: string;
//     totalActiveMembers: number;
//     totalPresent: number;
//     totalAbsent: number;
//     totalExcused: number;
//     attendanceRate: number;
//   };
//   records: Array<{
//     _id: string;
//     userId: {
//       name: string;
//       barcode: string;
//       role: string;
//     };
//     status: string;
//     date: string;
//     createdAt: string;
//   }>;
// }

// const AttendanceScanner = ({ params }: { params: Promise<{ userId: string }> }) => {
//   const resolvedParams = use(params);
//   const { user, isAuthenticated, isLoading } = useAuth();
//   const router = useRouter();
//   // const t = useTranslations('AttendanceScanner'); // Removed to avoid translation errors
//   const [barcode, setBarcode] = useState('');
//   const [isScanning, setIsScanning] = useState(false);
//   const [lastResult, setLastResult] = useState<AttendanceResult | null>(null);
//   const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);
//   const [recentScans, setRecentScans] = useState<any[]>([]);
//   const [showQRScanner, setShowQRScanner] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);
//   const [popupData, setPopupData] = useState<{title: string, message: string, type: 'success' | 'error' | 'warning', data?: any} | null>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const lastScannedRef = useRef('');

//   // Toast functions
//   const toast = {
//     success: (message: string, data?: any) => {
//       playSound('success');
//       setPopupData({
//         title: 'تم بنجاح!',
//         message: message,
//         type: 'success',
//         data: data
//       });
//       setShowPopup(true);
//     },
//     error: (message: string) => {
//       playSound('error');
//       setPopupData({
//         title: 'خطأ!',
//         message: message,
//         type: 'error'
//       });
//       setShowPopup(true);
//     },
//     warning: (message: string) => {
//       playSound('warning');
//       setPopupData({
//         title: 'تحذير!',
//         message: message,
//         type: 'warning'
//       });
//       setShowPopup(true);
//     }
//   };

//   useEffect(() => {
//     if (isLoading) return;
//     if (!isAuthenticated || user?.role !== 'admin') {
//       router.push('/');
//       return;
//     }
    
//     // إعادة التوجيه إذا كان userId في الرابط لا يساوي user.id
//     if (resolvedParams.userId && user?.id && resolvedParams.userId !== user.id) {
//       router.replace(`/ar/admin/attendance-scanner/${user.id}`);
//       return;
//     }
    
//     fetchTodaySummary();
//     fetchRecentScans();
//   }, [isAuthenticated, user, router, isLoading, resolvedParams.userId]);

//   // Auto-focus input on component mount and after popup closes
//   useEffect(() => {
//     if (inputRef.current && !isScanning && !showQRScanner) {
//       inputRef.current.focus();
//     }
//   }, []);

//   // Auto-focus after popup closes or QR scanner closes
//   useEffect(() => {
//     if (!showPopup && !showQRScanner && inputRef.current && !isScanning) {
//       // Small delay to ensure DOM is ready
//       setTimeout(() => {
//         inputRef.current?.focus();
//       }, 100);
//     }
//   }, [showPopup, showQRScanner, isScanning]);

//   // Auto-close popup after 3 seconds
//   useEffect(() => {
//     if (showPopup) {
//       const timer = setTimeout(() => {
//         setShowPopup(false);
//         setPopupData(null);
//       }, 3000);

//       return () => clearTimeout(timer);
//     }
//   }, [showPopup]);

//   const fetchTodaySummary = async () => {
//     try {
//       const data = await attendanceScanService.getTodayAttendanceSummary();
//       setTodaySummary(data);
//     } catch (error) {
//       console.error('Error fetching today summary:', error);
//     }
//   };

//   const fetchRecentScans = async () => {
//     try {
//       const data = await attendanceScanService.getAttendanceRecords({ limit: 10 });
//       setRecentScans(data.data.records);
//     } catch (error) {
//       console.error('Error fetching recent scans:', error);
//     }
//   };

//   const translateAttendanceError = (backendMessage: string | undefined, currentBarcode?: string) => {
//     const msg = (backendMessage || '').toLowerCase();
//     // Duplicate/Already scanned today
//     if (
//       msg.includes('already') ||
//       msg.includes('duplicate') ||
//       msg.includes('scanned') ||
//       (msg.includes('تم') && msg.includes('الحضور'))
//     ) {
//       return 'تم تسجيل الحضور مسبقًا لهذا اليوم.';
//     }
//     // Not found / invalid barcode
//     if (
//       msg.includes('not found') ||
//       msg.includes('no user') ||
//       msg.includes('invalid') ||
//       msg.includes('غير موجود')
//     ) {
//       return `الباركود الذي أدخلته غير موجود${currentBarcode ? `: ${currentBarcode}` : ''}`;
//     }
//     // Inactive / suspended account
//     if (msg.includes('inactive') || msg.includes('suspended') || msg.includes('محظور') || msg.includes('غير نشط')) {
//       return 'لا يمكن تسجيل الحضور لهذا الحساب لأنه غير نشط.';
//     }
//     // Subscription expired
//     if (msg.includes('انتهى الاشتراك') || msg.includes('تاريخ الاشتراك انتهى') || msg.includes('expired')) {
//       return 'تاريخ الاشتراك انتهى، يرجى التجديد.';
//     }
//     // Default: show backend message if exists, otherwise generic
//     if (backendMessage && backendMessage.trim().length > 0) {
//       return backendMessage;
//     }
//     return 'حدث خطأ أثناء مسح الباركود.';
//   };

//   const handleScan = async (scannedBarcode: string) => {
//     if (!scannedBarcode.trim()) return;
//     setIsScanning(true);
//     setBarcode(scannedBarcode);

//     // إذا كان أوفلاين: خزّن الحضور محليًا وأظهر رسالة مناسبة
//     if (typeof navigator !== 'undefined' && !navigator.onLine) {
//       try {
//         const clientUuid = `${scannedBarcode}-${Date.now()}`;
//         await queueAttendance({
//           clientUuid,
//           barcode: scannedBarcode,
//           time: new Date().toISOString(),
//           adminId: user?.id
//         });
//         toast.success('تم حفظ الحضور مؤقتًا وسيتم مزامنته عند عودة الاتصال بالإنترنت.');
//         fetchTodaySummary();
//         fetchRecentScans();
//       } catch (error) {
//         toast.error('حدث خطأ أثناء حفظ الحضور مؤقتًا.');
//       } finally {
//         setIsScanning(false);
//         setBarcode('');
//         // Removed auto-focus after offline save
//       }
//       return;
//     }

//     try {
//       const result = await attendanceScanService.scanBarcode(scannedBarcode);
//       setLastResult(result);

//       if (result.success) {
//         toast.success(result.message, result.data);
//         fetchTodaySummary();
//         fetchRecentScans();
//       } else {
//         toast.warning(translateAttendanceError(result.message, scannedBarcode));
//       }
//     } catch (error) {
//       console.error('Error scanning barcode:', error);
//       const message = error instanceof Error ? error.message : undefined;
//       toast.error(translateAttendanceError(message, scannedBarcode));
//     } finally {
//       setIsScanning(false);
//       setBarcode('');
//       // Removed auto-focus after result
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setBarcode(value);
    
//     // Auto-submit when barcode scanner sends data (usually ends with Enter)
//     if (value.includes('\n') || value.includes('\r')) {
//       const cleanBarcode = value.replace(/[\n\r]/g, '').trim();
//       if (cleanBarcode) {
//         handleScan(cleanBarcode);
//       }
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && barcode.trim()) {
//       handleScan(barcode.trim());
//     }
//   };

//   const handleQRScan = (data: string) => {
//     if (lastScannedRef.current === data) return; // تجاهل التكرار
//     lastScannedRef.current = data;
//     setShowQRScanner(false);
//     // Try to parse JSON data first (from QR code)
//     try {
//       const qrData = JSON.parse(data);
//       if (qrData.barcode) {
//         handleScan(qrData.barcode);
//       } else {
//         handleScan(data);
//       }
//     } catch {
//       // If not JSON, treat as plain barcode
//       handleScan(data);
//     }
//   };

//   // Handle QR scanner close
//   const handleQRScannerClose = () => {
//     setShowQRScanner(false);
//     // Focus will be restored by the useEffect hook
//   };

//   const formatTime = (dateString: string) => {
//     return new Date(dateString).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit'
//     });
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'present':
//         return <CheckCircle className="h-4 w-4 text-green-500" />;
//       case 'absent':
//         return <XCircle className="h-4 w-4 text-red-500" />;
//       case 'excused':
//         return <Clock className="h-4 w-4 text-gray-500" />;
//       default:
//         return <Clock className="h-4 w-4 text-gray-500" />;
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'present':
//         return <Badge variant="default" className="bg-green-500">حاضر</Badge>;
//       case 'absent':
//         return <Badge variant="destructive">غائب</Badge>;
//       case 'excused':
//         return <Badge variant="secondary" className="bg-gray-500">معذور</Badge>;
//       default:
//         return <Badge variant="outline">غير معروف</Badge>;
//     }
//   };

//   if (isLoading) {
//     return <LoadingSpinner  />;
//   }

//   return (
//     <div className="min-h-screen theme-gradient-bg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
//       <div className="container mx-auto p-6 space-y-6">
//         <div className="flex items-center justify-between flex-wrap gap-2">
//           <div className="flex items-center space-x-4">
//             <Button
//               variant="outline"
//               onClick={() => router.push(`/admin/dashboard/${user?.id || resolvedParams.userId}`)}
//               className="flex items-center space-x-2 cursor-pointer"
//             >
//               <ArrowRight className="h-4 w-4" />
//               <span className="sm:text-xl text-sm ">العودة للوحة التحكم</span>
//             </Button>
//             <div>
//               <h1 className="sm:text-3xl font-bold text-gray-900 dark:text-white">ماسح الحضور</h1>
//               <p className="text-gray-600 dark:text-gray-300">امسح باركود الأعضاء لتسجيل الحضور</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <Scan className="h-6 w-6 text-gray-500 dark:text-gray-400" />
//             <span className="text-sm text-gray-500 dark:text-gray-400">جاهز للمسح</span>
//           </div>
//         </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Scanner Input */}
//         <div className="lg:col-span-2">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <QrCode className="h-5 w-5" />
//                 <span>ماسح الباركود</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <label htmlFor="barcode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                   امسح أو أدخل الباركود
//                 </label>
//                 <input
//                   ref={inputRef}
//                   id="barcode"
//                   type="text"
//                   value={barcode}
//                   onChange={handleInputChange}
//                   onKeyPress={handleKeyPress}
//                   placeholder="امسح الباركود أو اكتبه يدوياً..."
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-lg font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-600"
//                   disabled={isScanning}
//                 />
//               </div>


//               <div className="flex space-x-2">
//                 <Button
//                   onClick={() => handleScan(barcode)}
//                   disabled={!barcode.trim() || isScanning}
//                   className="flex-1"
//                 >
//                   {isScanning ? 'جاري المعالجة...' : 'تسجيل الحضور'}
//                 </Button>
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setShowQRScanner(true);
//                     // Blur input when opening QR scanner to prevent conflicts
//                     inputRef.current?.blur();
//                   }}
//                   className="flex items-center space-x-2"
//                 >
//                   <Camera className="h-4 w-4" />
//                   <span>مسح QR</span>
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Today's Summary */}
//         <div className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Calendar className="h-5 w-5" />
//                 <span>ملخص اليوم</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {todaySummary ? (
//                 <div className="space-y-3">
//                   <div className="text-center">
//                     <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
//                       {todaySummary.summary.attendanceRate}%
//                     </div>
//                     <div className="text-sm text-gray-500 dark:text-gray-400">معدل الحضور</div>
//                   </div>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <div className="text-center">
//                       <div className="font-semibold text-green-600 dark:text-green-400">
//                         {todaySummary.summary.totalPresent}
//                       </div>
//                       <div className="text-gray-500 dark:text-gray-400">حاضر</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="font-semibold text-gray-600 dark:text-gray-400">
//                         {todaySummary.summary.totalActiveMembers}
//                       </div>
//                       <div className="text-gray-500 dark:text-gray-400">إجمالي الأعضاء</div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center text-gray-500 dark:text-gray-400">جاري التحميل...</div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Recent Scans */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center space-x-2">
//                 <Clock className="h-5 w-5" />
//                 <span>المسوحات الأخيرة</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2 max-h-64 overflow-y-auto">
//                 {(() => {
//                   const validScans = recentScans.filter(scan => scan.userId);
//                   return validScans.length > 0 ? validScans.map((scan) => (
//                     <div key={scan._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
//                       <div className="flex items-center space-x-2">
//                         {getStatusIcon(scan.status)}
//                         <div>
//                           <div className="font-medium text-sm text-gray-900 dark:text-white">
//                             {scan.userId?.name || 'عضو غير معروف'}
//                           </div>
//                           <div className="text-xs text-gray-500 dark:text-gray-400">
//                             {scan.userId?.barcode || 'N/A'}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(scan.createdAt)}</div>
//                         {getStatusBadge(scan.status)}
//                       </div>
//                     </div>
//                   )) : (
//                     <div className="text-center text-gray-500 dark:text-gray-400 text-sm">لا توجد مسوحات حديثة</div>
//                   );
//                 })()}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* QR Code Scanner Modal */}
//       {showQRScanner && (
//         <QRCodeScanner
//           onScan={handleQRScan}
//           onClose={handleQRScannerClose}
//         />
//       )}

//       {/* Popup Modal */}
//       {popupData && (
//         <PopupModal
//           isOpen={showPopup}
//           onClose={() => {
//             setShowPopup(false);
//             setPopupData(null);
//             // Focus will be restored by the useEffect hook
//           }}
//           title={popupData.title}
//           message={popupData.message}
//           type={popupData.type}
//           data={popupData.data}
//         />
//       )}
//       </div>
//     </div>
//   );
// };

// export default AttendanceScanner;



'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/i18n/navigation';
import {
  CheckCircle, XCircle, Clock, Calendar, QrCode,
  Scan, Camera, ArrowRight, Wifi, WifiOff,
} from 'lucide-react';
import QRCodeScanner from '@/components/admin/QRCodeScanner';
import { attendanceScanService } from '@/services/membershipCardService';
import { queueAttendance } from '@/lib/offlineSync';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VideoTutorial from '@/components/VideoTutorial';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceResult {
  success: boolean;
  message: string;
  data?: {
    user: { id: string; name: string; barcode: string; email: string; membershipLevel: string };
    attendance: { id: string; date: string; status: string; time: string };
  };
}

interface TodaySummary {
  summary: {
    date: string;
    totalActiveMembers: number;
    totalPresent: number;
    totalAbsent: number;
    totalExcused: number;
    attendanceRate: number;
  };
  records: Array<{
    _id: string;
    userId: { name: string; barcode: string; role: string };
    status: string;
    date: string;
    createdAt: string;
  }>;
}

type PopupType = 'success' | 'error' | 'warning' | 'offline';

interface PopupState {
  type: PopupType;
  title: string;
  message: string;
  data?: AttendanceResult['data'];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AttendanceScannerProps {
  userId: string;
  role: 'admin' | 'manager';
  showVideoTutorial?: boolean;
  videoId?: string;
}

// ─── Sound ────────────────────────────────────────────────────────────────────

function playSound(type: 'success' | 'error' | 'warning') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    } else if (type === 'error') {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(300, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.2);
    } else {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
    }

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
}

// ─── Error translator ─────────────────────────────────────────────────────────

function translateError(msg: string | undefined, barcode?: string): string {
  const m = (msg || '').toLowerCase();
  if (m.includes('already') || m.includes('duplicate') || m.includes('scanned') || (m.includes('تم') && m.includes('الحضور')))
    return 'تم تسجيل الحضور مسبقًا لهذا اليوم.';
  if (m.includes('not found') || m.includes('no user') || m.includes('invalid') || m.includes('غير موجود'))
    return `الباركود غير موجود${barcode ? `: ${barcode}` : ''}`;
  if (m.includes('inactive') || m.includes('suspended') || m.includes('محظور') || m.includes('غير نشط'))
    return 'الحساب غير نشط، لا يمكن تسجيل الحضور.';
  if (m.includes('انتهى الاشتراك') || m.includes('expired'))
    return 'انتهى الاشتراك، يرجى التجديد.';
  return msg && msg.trim() ? msg : 'حدث خطأ أثناء مسح الباركود.';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    present: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    absent:  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    excused: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };
  const label: Record<string, string> = { present: 'حاضر', absent: 'غائب', excused: 'معذور' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {label[status] ?? 'غير معروف'}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'present') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (status === 'absent')  return <XCircle     className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-gray-400" />;
}

// ─── Popup ────────────────────────────────────────────────────────────────────

function Popup({ popup, onClose }: { popup: PopupState; onClose: () => void }) {
  const cfg = {
    success: {
      border: 'border-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: <CheckCircle className="h-10 w-10 text-emerald-500" />,
    },
    error: {
      border: 'border-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: <XCircle className="h-10 w-10 text-red-500" />,
    },
    warning: {
      border: 'border-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: <Clock className="h-10 w-10 text-amber-500" />,
    },
    offline: {
      border: 'border-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: <WifiOff className="h-10 w-10 text-blue-500" />,
    },
  }[popup.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`
          relative w-full max-w-sm rounded-2xl shadow-2xl border-2 overflow-hidden
          bg-white dark:bg-gray-900 ${cfg.border}
          animate-[fadeInScale_0.2s_ease-out]
        `}
        style={{ animation: 'fadeInScale 0.18s ease-out' }}
      >
        <div className={`${cfg.bg} px-6 pt-8 pb-6 text-center`}>
          <div className="flex justify-center mb-4">{cfg.icon}</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{popup.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{popup.message}</p>

          {popup.data && (
            <div className="mt-4 bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 text-right space-y-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">العضو: </span>{popup.data.user.name}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">الباركود: </span>{popup.data.user.barcode}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">الوقت: </span>
                {new Date(popup.data.attendance.time).toLocaleTimeString('ar-SA', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
        <div className="px-6 pb-5 bg-white dark:bg-gray-900">
          <button
            onClick={onClose}
            className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
          >
            موافق
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AttendanceScanner({
  userId,
  role,
  showVideoTutorial = false,
  videoId = 'ytPIb5HugAw',
}: AttendanceScannerProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [barcode, setBarcode]               = useState('');
  const [isScanning, setIsScanning]         = useState(false);
  const [todaySummary, setTodaySummary]     = useState<TodaySummary | null>(null);
  const [recentScans, setRecentScans]       = useState<any[]>([]);
  const [showQRScanner, setShowQRScanner]   = useState(false);
  const [popup, setPopup]                   = useState<PopupState | null>(null);
  const [isOnline, setIsOnline]             = useState(true);

  const inputRef        = useRef<HTMLInputElement>(null);
  const lastScannedRef  = useRef('');
  const popupTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Network status ─────────────────────────────────────────────────────────
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    const allowed = role === 'admin'
      ? user?.role === 'admin'
      : user?.role === 'manager' || user?.role === 'admin';
    if (!isAuthenticated || !allowed) { router.push('/'); return; }
    if (userId && user?.id && userId !== user.id) {
      const base = role === 'admin' ? 'admin' : 'manager';
      router.replace(`/ar/${base}/dashboard/${user.id}`);
      return;
    }
    fetchTodaySummary();
    fetchRecentScans();
  }, [isAuthenticated, user, isLoading]);

  // ── Global keydown — works even when tab is not focused on input ───────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {

        
      if (popup || showQRScanner || isScanning) return;

      // Ignore if user is typing in another input/textarea
      const target = e.target as HTMLElement;

       // ✅ لو الـ focus على input الباركود نفسه — سيبه للـ onChange
        if (target === inputRef.current) return;  // ← السطر ده بس

        if (popup || showQRScanner || isScanning) return;

        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;


      if (target !== inputRef.current &&
          (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      if (e.key === 'Enter') {
        const val = barcode.trim();
        if (val) handleScan(val);
        return;
      }

      if (e.key === 'Backspace') {
        setBarcode(prev => prev.slice(0, -1));
        inputRef.current?.focus();
        return;
      }

      // Printable chars only
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setBarcode(prev => prev + e.key);
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [barcode, popup, showQRScanner, isScanning]);


  // ── Auto-focus after popup / QR close ─────────────────────────────────────
  useEffect(() => {
    if (!popup && !showQRScanner && !isScanning) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [popup, showQRScanner, isScanning]);

  // ── Auto-close popup ───────────────────────────────────────────────────────
  const showPopup = useCallback((state: PopupState) => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setPopup(state);
    popupTimerRef.current = setTimeout(() => setPopup(null), 3500);
  }, []);

  const closePopup = useCallback(() => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setPopup(null);
  }, []);

  // ── Data fetchers ──────────────────────────────────────────────────────────
  const fetchTodaySummary = async () => {
    try {
      const data = await attendanceScanService.getTodayAttendanceSummary();
      setTodaySummary(data);
    } catch {}
  };

  const fetchRecentScans = async () => {
    try {
      const data = await attendanceScanService.getAttendanceRecords({ limit: 10 });
      setRecentScans(data.data.records);
    } catch {}
  };

  // ── Scan handler ───────────────────────────────────────────────────────────
  const handleScan = useCallback(async (scannedBarcode: string) => {
    if (!scannedBarcode.trim() || isScanning) return;
    setIsScanning(true);
    setBarcode('');

    // Offline
    if (!navigator.onLine) {
      try {
        await queueAttendance({
          clientUuid: `${scannedBarcode}-${Date.now()}`,
          barcode: scannedBarcode,
          time: new Date().toISOString(),
          adminId: user?.id,
        });
        playSound('warning');
        showPopup({
          type: 'offline',
          title: 'حفظ أوفلاين',
          message: 'تم حفظ الحضور مؤقتًا وسيتم مزامنته عند عودة الاتصال.',
        });
        fetchTodaySummary();
        fetchRecentScans();
      } catch {
        playSound('error');
        showPopup({ type: 'error', title: 'خطأ!', message: 'فشل حفظ الحضور مؤقتًا.' });
      } finally {
        setIsScanning(false);
      }
      return;
    }

    // Online
    try {
      const result = await attendanceScanService.scanBarcode(scannedBarcode);
      if (result.success) {
        playSound('success');
        showPopup({ type: 'success', title: 'تم بنجاح!', message: result.message, data: result.data });
        fetchTodaySummary();
        fetchRecentScans();
      } else {
        playSound('warning');
        showPopup({ type: 'warning', title: 'تحذير!', message: translateError(result.message, scannedBarcode) });
      }
    } catch (err) {
      playSound('error');
      const msg = err instanceof Error ? err.message : undefined;
      showPopup({ type: 'error', title: 'خطأ!', message: translateError(msg, scannedBarcode) });
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, user?.id, showPopup]);

  // Add barcode scanner hook after handleScan is defined
  const { hidConnected, connectHID, disconnectHID } = useBarcodeScanner({
    onScan: handleScan,
    inputRef: inputRef,
    disabled: !!popup || showQRScanner || isScanning,
    minLength: 3,
    scanDelay: 50,
  });

  // ── Input handlers ─────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes('\n') || val.includes('\r')) {
      const clean = val.replace(/[\n\r]/g, '').trim();
      if (clean) handleScan(clean);
      return;
    }
    setBarcode(val);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode.trim()) handleScan(barcode.trim());
  };

  // ── QR handler ─────────────────────────────────────────────────────────────
  const handleQRScan = (data: string) => {
    if (lastScannedRef.current === data) return;
    lastScannedRef.current = data;
    setShowQRScanner(false);
    try {
      const parsed = JSON.parse(data);
      handleScan(parsed.barcode ?? data);
    } catch {
      handleScan(data);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleBack = () => {
    const base = role === 'admin' ? 'admin' : 'manager';
    router.push(`/${base}/dashboard/${user?.id ?? userId}`);
  };

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingSpinner />;

  const validScans = recentScans.filter(s => s.userId);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

      {showVideoTutorial && (
        <VideoTutorial
          videoId={videoId}
          title="تسجيل حضور بالباركود أو الكاميرا أو الكود اليدوي"
          position="bottom-right"
          buttonText="شرح"
        />
      )}

      <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-5xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Old back button - same tab */}
            <button
              onClick={() => {
                const base = user?.role === 'admin' ? 'admin' : 'manager';
                router.push(`/${base}/dashboard/${user?.id ?? userId}`);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="hidden sm:inline">العودة للوحة التحكم</span>
            </button>
            
            {/* New dashboard button - new tab */}
            <button
              onClick={() => {
                const base = user?.role === 'admin' ? 'admin' : 'manager';
                window.open(`/${base}/dashboard/${user?.id ?? userId}`, '_blank');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="hidden sm:inline">فتح لوحة التحكم فى تابة جديدة </span>
            </button>
            
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">ماسح الحضور</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">امسح باركود الأعضاء لتسجيل الحضور</p>
            </div>
          </div>

          {/* Online indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
          }`}>
            {isOnline
              ? <><Wifi className="h-3.5 w-3.5" /> متصل</>
              : <><WifiOff className="h-3.5 w-3.5" /> غير متصل</>
            }
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Scanner card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">ماسح الباركود</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Input */}
              <div>
                <label htmlFor="barcode-input" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  امسح أو أدخل الباركود
                </label>
                <input
                  ref={inputRef}
                  id="barcode-input"
                  type="text"
                  value={barcode}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="امسح الباركود أو اكتبه يدوياً..."
                  disabled={isScanning}
                  autoFocus
                  className="
                    w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600
                    bg-gray-50 dark:bg-gray-700/50
                    text-lg font-mono text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all
                  "
                />
              </div>

              {/* Hint */}
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Scan className="h-3.5 w-3.5 shrink-0" />
                يعمل الماسح تلقائياً حتى لو لم يكن الحقل محدداً
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleScan(barcode)}
                  disabled={!barcode.trim() || isScanning}
                  className="
                    flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white
                    bg-gray-800 dark:bg-gray-100 dark:text-gray-900
                    hover:bg-gray-700 dark:hover:bg-white
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all active:scale-[0.98]
                  "
                >
                  {isScanning ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      جاري المعالجة...
                    </span>
                  ) : 'تسجيل الحضور'}
                </button>

                <button
                  onClick={() => { setShowQRScanner(true); inputRef.current?.blur(); }}
                  className="
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                    border border-gray-200 dark:border-gray-600
                    text-gray-700 dark:text-gray-300
                    bg-white dark:bg-gray-700
                    hover:bg-gray-50 dark:hover:bg-gray-600
                    transition-all active:scale-[0.98]
                  "
                >
                  <Camera className="h-4 w-4" />
                  <span>مسح QR</span>
                </button>
              </div>

              {/* USB Scanner Connection */}
            {/* توصيل جهاز الاسكانر USB */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            {hidConnected ? (
                <button
                onClick={disconnectHID}
                className="w-full py-2 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 
                            bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 
                            dark:border-emerald-800 font-medium"
                >
                <span className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>تم توصيل جهاز الاسكانر - اضغط للفصل</span>
                </span>
                </button>
            ) : (
                <button
                onClick={connectHID}
                className="w-full py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 
                            bg-gray-50 dark:bg-gray-700/40 border border-gray-200 
                            dark:border-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                <span className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>توصيل جهاز الاسكانر USB مباشرة (بدون برامج)</span>
                </span>
                </button>
            )}
            </div>
            </div>
          </div>

          {/* Stats column */}
          <div className="space-y-4">

            {/* Today summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h2 className="font-semibold text-sm text-gray-900 dark:text-white">ملخص اليوم</h2>
              </div>
              <div className="p-5">
                {todaySummary ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-800 dark:text-white">
                        {todaySummary.summary.attendanceRate}%
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">معدل الحضور</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {todaySummary.summary.totalPresent}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">حاضر</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                          {todaySummary.summary.totalActiveMembers}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">الإجمالي</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-400 py-4">جاري التحميل...</div>
                )}
              </div>
            </div>

            {/* Recent scans */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <h2 className="font-semibold text-sm text-gray-900 dark:text-white">المسوحات الأخيرة</h2>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-700/50 max-h-72 overflow-y-auto">
                {validScans.length > 0 ? validScans.map(scan => (
                  <div key={scan._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <StatusIcon status={scan.status} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                          {scan.userId?.name ?? 'عضو غير معروف'}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {scan.userId?.barcode ?? 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs text-gray-400">{formatTime(scan.createdAt)}</div>
                      <StatusBadge status={scan.status} />
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-sm text-gray-400 py-8">لا توجد مسوحات حديثة</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── QR Scanner modal ── */}
      {showQRScanner && (
        <QRCodeScanner onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />
      )}

      {/* ── Popup ── */}
      {popup && <Popup popup={popup} onClose={closePopup} />}
    </div>
  );
}

export default AttendanceScanner;