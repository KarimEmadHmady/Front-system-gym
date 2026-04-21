'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, QrCode, BarChart3 } from 'lucide-react';

import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { membershipCardService, userService } from '@/services/membershipCardService';
import { GymSettingsService } from '@/services/gymSettingsService';
import { getAuthToken } from '@/lib/api';

import { GenerationControls } from './GenerationControls';
import { SequentialBarcodeForm } from './SequentialBarcodeForm';
import { CardStyleSettings } from './CardStyleSettings';
import { FrontCardStyleSettings } from './FrontCardStyleSettings';
import { UsersTable } from './UsersTable';
import { GenerationResultDialog } from './GenerationResultDialog';

import type {
  User,
  GeneratedCard,
  CardGenerationResult,
  CardStyleType,
  FrontStyleType,
  UploadedFiles,
} from './types';

// ─── Card wrapper helpers (local, no dep) ─────────────────────────────────────
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{children}</h3>
);
const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const AdminMembershipCards = () => {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const toast = {
    success: (msg: string) => showSuccess('تم', msg),
    error: (msg: string) => showError('خطأ', msg),
    warning: (msg: string) => showWarning('تنبيه', msg),
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [generationResult, setGenerationResult] = useState<CardGenerationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const pageSize = 10;

  const [cardStyle, setCardStyle] = useState<CardStyleType>({
    backgroundColor: '#f8f9fa',
    textColor: '#000000',
    accentColor: '#007bff',
    backgroundOpacity: 1,
  } as any);

  const [frontStyle, setFrontStyle] = useState<FrontStyleType>({
    backgroundColor: '#ffffff',
    backgroundImage: '',
    patternImage: '',
    patternOpacity: 0.1,
    centerLogoUrl: '',
    centerLogoWidth: 120,
    centerLogoHeight: 120,
    showFrontDesign: false,
    showContactInfo: false,
    contactInfoColor: '#333333',
    contactInfoFontSize: 8,
    contactInfoLineHeight: 10,
  } as any);

  const [barcodePrefix, setBarcodePrefix] = useState('G');
  const [startNumber, setStartNumber] = useState(1);
  const [numberOfCardsToGenerate, setNumberOfCardsToGenerate] = useState(10);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({});
  const [uploadedFrontFiles, setUploadedFrontFiles] = useState<{ backgroundImage?: File }>({});

  const gymSettingsService = new GymSettingsService();

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchUsers();
    fetchGeneratedCards();
    loadCardStyle();
  }, []);

  useEffect(() => { setUsersPage(1); }, [searchTerm, roleFilter, users]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const loadCardStyle = async () => {
    try {
      const settings = await gymSettingsService.get();
      if ((settings as any).membershipCardStyle) setCardStyle({ ...(settings as any).membershipCardStyle });
      if ((settings as any).membershipCardFront) setFrontStyle({ ...(settings as any).membershipCardFront });
    } catch (e) {
      console.error('Failed to load card style', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch {
      toast.error('Error fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGeneratedCards = async () => {
    try {
      const data = await membershipCardService.getGeneratedCards();
      setGeneratedCards(data);
    } catch {
      setGeneratedCards([]);
    }
  };

  // ── File upload handlers ───────────────────────────────────────────────────
  const handleFileUpload = (fieldName: string, file: File | null) => {
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      if (fieldName === 'backgroundImage') setCardStyle((prev) => ({ ...prev, backgroundImage: url }));
    } else {
      setUploadedFiles((prev) => { const n = { ...prev }; delete n[fieldName as keyof UploadedFiles]; return n; });
      if (fieldName === 'backgroundImage') setCardStyle((prev) => ({ ...prev, backgroundImage: '' }));
    }
  };

  const handleFrontFileUpload = (fieldName: string, file: File | null) => {
    if (file) {
      setUploadedFrontFiles((prev) => ({ ...prev, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      if (fieldName === 'backgroundImage') setFrontStyle((prev) => ({ ...prev, backgroundImage: url }));
    } else {
      setUploadedFrontFiles((prev) => { const n = { ...prev }; delete n[fieldName as keyof typeof n]; return n; });
      if (fieldName === 'backgroundImage') setFrontStyle((prev) => ({ ...prev, backgroundImage: '' }));
    }
  };

  // ── Save settings ──────────────────────────────────────────────────────────
  const saveCardStyle = async () => {
    try {
      const formData = new FormData();
      formData.append('membershipCardStyle', JSON.stringify(cardStyle));
      formData.append('membershipCardFront', JSON.stringify({
        ...frontStyle,
        showFrontDesign: String(frontStyle.showFrontDesign),
        showContactInfo: String(frontStyle.showContactInfo),
        contactInfoFontSize: String(frontStyle.contactInfoFontSize),
        contactInfoLineHeight: String(frontStyle.contactInfoLineHeight),
      }));

      if (uploadedFiles.backgroundImage) formData.append('membershipCardBackgroundImage', uploadedFiles.backgroundImage);
      else if (cardStyle.backgroundImage) formData.append('membershipCardBackgroundImageUrl', cardStyle.backgroundImage as string);

      if (uploadedFrontFiles.backgroundImage) formData.append('backgroundImage', uploadedFrontFiles.backgroundImage);
      else if (frontStyle.backgroundImage) formData.append('backgroundImageUrl', frontStyle.backgroundImage as string);

      if (uploadedFiles.patternImage) formData.append('patternImage', uploadedFiles.patternImage);
      else if (frontStyle.patternImage) formData.append('patternImageUrl', frontStyle.patternImage as string);

      if (uploadedFiles.centerLogoUrl) formData.append('centerLogoUrl', uploadedFiles.centerLogoUrl);
      else if (frontStyle.centerLogoUrl) formData.append('centerLogoImageUrl', frontStyle.centerLogoUrl as string);

      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/gym-settings`,
        { method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'فشل حفظ الإعدادات');
      }

      const result = await response.json();
      const updated = result.settings || result;
      setCardStyle({ ...(updated as any).membershipCardStyle });
      setFrontStyle({ ...(updated as any).membershipCardFront });
      setUploadedFiles({});
      toast.success('تم حفظ إعدادات تصميم البطاقة');
    } catch (e) {
      console.error('Error saving card style:', e);
      toast.error('فشل حفظ إعدادات التصميم');
    }
  };

  // ── Generation actions ─────────────────────────────────────────────────────
  const generateSingleCard = async (userId: string) => {
    setIsGenerating(true);
    try {
      const blob = await membershipCardService.generateUserCard(userId);
      const user = users.find((u) => u._id === userId);
      const name = user ? user.name.replace(/[^a-zA-Z0-9]/g, '_') : userId;
      triggerDownload(blob, `membership_card_${name}.pdf`);
      toast.success('Card generated and downloaded successfully');
    } catch {
      toast.error('Error generating card');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDoubleSidedCard = async (userId: string) => {
    setIsGenerating(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/membership-cards/generate-double/${userId}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) } }
      );
      if (!response.ok) throw new Error('Card generation failed');
      const blob = await response.blob();
      const user = users.find((u) => u._id === userId);
      const name = user ? user.name.replace(/[^a-zA-Z0-9]/g, '_') : userId;
      triggerDownload(blob, `membership_card_double_${name}.pdf`);
      toast.success('Double-sided card generated and downloaded successfully');
    } catch {
      toast.error('Error generating double-sided card');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllMemberCards = async () => {
    setIsGenerating(true);
    try {
      const result = await membershipCardService.generateAllMemberCards();
      setGenerationResult(result as CardGenerationResult);
      setShowResults(true);
      if (result.success) { toast.success(`Generated ${result.data.totalGenerated} cards successfully`); fetchGeneratedCards(); }
      else toast.error(result.message);
    } catch { toast.error('Error generating all cards'); }
    finally { setIsGenerating(false); }
  };

  const handleDownloadSelected = async () => {
    if (selectedUsers.length === 0) { toast.warning('اختر مستخدمين أولاً'); return; }
    setIsGenerating(true);
    try {
      const blob = await membershipCardService.downloadCombinedCards(selectedUsers);
      triggerDownload(blob, 'membership_cards_selected.pdf');
      toast.success('تم تحميل ملف PDF مجمع للمحددين');
    } catch { toast.error('فشل تحميل الملف المجمع'); }
    finally { setIsGenerating(false); }
  };

  const handleDownloadAll = async () => {
    setIsGenerating(true);
    try {
      const blob = await membershipCardService.downloadCombinedCardsAll();
      triggerDownload(blob, 'membership_cards_all_members.pdf');
      toast.success('تم تحميل ملف PDF مجمع لكل الأعضاء');
    } catch { toast.error('فشل تحميل الملف المجمع'); }
    finally { setIsGenerating(false); }
  };

  const handleGenerateSequentialCards = async () => {
    if (!barcodePrefix.trim()) { toast.error('يرجى إدخال بادئة للباركود.'); return; }
    if (startNumber <= 0) { toast.error('الرقم المبتدئ يجب أن يكون أكبر من صفر.'); return; }
    if (numberOfCardsToGenerate <= 0) { toast.error('عدد الكروت للتوليد يجب أن يكون أكبر من صفر.'); return; }

    setIsGenerating(true);
    try {
      const result = await membershipCardService.generateSequentialCards({
        prefix: barcodePrefix.trim(),
        start: startNumber,
        count: numberOfCardsToGenerate,
      });
      setGenerationResult(result as CardGenerationResult);
      setShowResults(true);

      if (result.success) {
        toast.success(`تم توليد ${result?.data?.totalGenerated} باركودات متسلسلة بنجاح`);
        fetchUsers();
        if (result?.data?.results) {
          const newCards: GeneratedCard[] = result.data.results.map((item: any) => ({
            fileName: item.fileName,
            filePath: item.filePath,
            barcode: item.barcode,
            size: 0,
            created: undefined,
          }));
          setGeneratedCards((prev) => [...newCards, ...prev]);
        }
        if (result?.data?.combinedPdfBuffer && result?.data?.combinedPdfFileName) {
          downloadBase64Pdf(result.data.combinedPdfBuffer, result.data.combinedPdfFileName);
          toast.success('تم تحميل ملف PDF المجمع للباركودات المتسلسلة.');
        }
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('حدث خطأ أثناء توليد الباركودات المتسلسلة');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── User selection ─────────────────────────────────────────────────────────
  const handleSelectUser = (userId: string, checked: boolean) =>
    setSelectedUsers((prev) => checked ? [...prev, userId] : prev.filter((id) => id !== userId));

  const handleSelectAll = (checked: boolean) => {
    const filtered = users.filter((u) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = term === '' || [u.name, u.email, u.barcode, u.phone, u.userNumber != null ? String(u.userNumber) : ''].filter(Boolean).some((v) => String(v).toLowerCase().includes(term));
      return matchesSearch && (roleFilter === 'all' || u.role === roleFilter);
    });
    setSelectedUsers(checked ? filtered.map((u) => u._id) : []);
  };

  // ── Utils ──────────────────────────────────────────────────────────────────
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    window.URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  const downloadBase64Pdf = (base64: string, filename: string) => {
    try {
      const bytes = atob(base64);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      triggerDownload(new Blob([arr], { type: 'application/pdf' }), filename);
    } catch (e) {
      console.error('Error decoding Base64 PDF:', e);
      toast.error('فشل فك تشفير ملف PDF.');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 min-h-screen dark:text-gray-100 p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">بطاقات العضوية</h2>
          <p className="text-gray-600 dark:text-gray-300">توليد وإدارة بطاقات العضوية مع QR وباركود</p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <QrCode className="h-6 w-6 text-gray-500" />
          <BarChart3 className="h-6 w-6 text-green-500" />
        </div>
      </div>

      {/* Generation Controls */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="dark:border-gray-700">
          <CardTitle>توليد البطاقات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <GenerationControls
            isGenerating={isGenerating}
            selectedUsers={selectedUsers}
            generatedCards={generatedCards}
            generationResult={generationResult}
            onGenerateAll={generateAllMemberCards}
            onDownloadSelected={handleDownloadSelected}
            onDownloadAll={handleDownloadAll}
            onClearCards={() => setGeneratedCards([])}
          />
          <SequentialBarcodeForm
            barcodePrefix={barcodePrefix}
            startNumber={startNumber}
            numberOfCardsToGenerate={numberOfCardsToGenerate}
            isGenerating={isGenerating}
            onPrefixChange={setBarcodePrefix}
            onStartNumberChange={setStartNumber}
            onCountChange={setNumberOfCardsToGenerate}
            onGenerate={handleGenerateSequentialCards}
          />
        </CardContent>
      </Card>

      {/* Back card style */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="dark:border-gray-700">
          <CardTitle>إعدادات تصميم بطاقة العضوية (الظهر)</CardTitle>
        </CardHeader>
        <CardContent>
          <CardStyleSettings
            cardStyle={cardStyle}
            uploadedFiles={uploadedFiles}
            onStyleChange={setCardStyle}
            onFileUpload={handleFileUpload}
            onSave={saveCardStyle}
            onReload={loadCardStyle}
          />
        </CardContent>
      </Card>

      {/* Front card style */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="dark:border-gray-700">
          <CardTitle>إعدادات تصميم الوجه الأمامي للبطاقة</CardTitle>
        </CardHeader>
        <CardContent>
          <FrontCardStyleSettings
            frontStyle={frontStyle}
            uploadedFiles={uploadedFiles}
            uploadedFrontFiles={uploadedFrontFiles}
            onStyleChange={setFrontStyle}
            onFileUpload={handleFileUpload}
            onFrontFileUpload={handleFrontFileUpload}
            onSave={saveCardStyle}
            onReload={loadCardStyle}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="dark:border-gray-700">
          <CardTitle>المستخدمون</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            selectedUsers={selectedUsers}
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            isGenerating={isGenerating}
            currentPage={usersPage}
            pageSize={pageSize}
            onSearchChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onPageChange={setUsersPage}
            onGenerateSingle={generateSingleCard}
            onGenerateDouble={generateDoubleSidedCard}
          />
        </CardContent>
      </Card>

      {/* Dialog */}
      <GenerationResultDialog
        open={showResults}
        result={generationResult}
        onClose={() => setShowResults(false)}
      />

      {/* Alert */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type as any}
        duration={alertState.duration}
      />
    </div>
  );
};

export default AdminMembershipCards;