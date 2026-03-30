'use client';

import React, { useState, useEffect } from 'react';
// Simple UI components - using basic HTML elements
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, disabled = false, className = '', variant = 'default' }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean; 
  className?: string;
  variant?: 'default' | 'outline' | 'destructive';
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    default: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = '', type = 'text', disabled = false }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  disabled?: boolean;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${disabled ? 'bg-gray-100' : ''} ${className}`}
  />
);

const Badge = ({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Alert = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 rounded-md ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">
    {children}
  </div>
);

const Select = ({ value, onValueChange, children }: { 
  value: string; 
  onValueChange: (value: string) => void; 
  children: React.ReactNode;
}) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
  >
    {children}
  </select>
);

const SelectTrigger = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative ${className}`}>
    {children}
  </div>
);

const SelectValue = ({ placeholder }: { placeholder: string }) => (
  <span className="text-gray-500">{placeholder}</span>
);

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
    {children}
  </div>
);

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">{children}</option>
);

const Table = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

const TableRow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <tr className={`hover:bg-gray-50 ${className}`}>
    {children}
  </tr>
);

const TableHead = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
    {children}
  </td>
);

const Dialog = ({ children, open, onOpenChange }: { 
  children: React.ReactNode; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">
    {children}
  </div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold text-gray-900 text-center">
    {children}
  </h2>
);

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 mt-1 text-center">
    {children}
  </p>
);

const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
  <>{children}</>
);

const Checkbox = ({ checked, onCheckedChange, className = '' }: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void; 
  className?: string;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    className={`h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded ${className}`}
  />
);

const FileInput = ({ 
  onChange, 
  accept = "image/*", 
  className = '', 
  label = '',
  currentFile,
  currentUrl
}: {
  onChange: (file: File | null) => void;
  accept?: string;
  className?: string;
  label?: string;
  currentFile?: File;
  currentUrl?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 dark:file:bg-gray-700 dark:file:text-gray-300"
      />
      {(currentFile || currentUrl) && (
        <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {currentFile ? `تم اختيار: ${currentFile.name}` : ''}
            </span>
            {currentUrl && (
              <img 
                src={currentUrl} 
                alt="Preview" 
                className="w-8 h-8 object-cover rounded border border-gray-300"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            إزالة
          </button>
        </div>
      )}
    </div>
  </div>
);
import { 
  FileText, 
  Download, 
  Users, 
  User, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  QrCode,
  BarChart3,
  X
} from 'lucide-react';
import CustomAlert from '@/components/ui/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { membershipCardService, userService } from '@/services/membershipCardService';
import { GymSettingsService, type GymSettings } from '@/services/gymSettingsService';
import { getAuthToken } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  barcode: string;
  role: string;
  membershipLevel: string;
  status: string;
  phone?: string;
  userNumber?: string | number;
}

export interface GeneratedCard {
  fileName: string;
  filePath: string;
  barcode?: string;
  size: number;
  created?: string; // ✅ بقت اختيارية
}

interface CardGenerationResult {
  success: boolean;
  message: string;
  data: {
    results: Array<{
      success: boolean;
      message: string;
      fileName: string;
      filePath: string;
      user: {
        id: string;
        name: string;
        barcode: string;
        email: string;
      };
    }>;
    errors: Array<{
      userId: string;
      error: string;
    }>;
    totalRequested: number;
    totalGenerated: number;
    totalErrors: number;
    combinedPdfBuffer?: string; // Added for combined PDF
    combinedPdfFileName?: string; // Added for combined PDF
  };
}

const AdminMembershipCards = () => {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();
  const toast = {
    success: (message: string) => showSuccess('تم', message),
    error: (message: string) => showError('خطأ', message),
    warning: (message: string) => showWarning('تنبيه', message)
  };
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
  const [cardsPage, setCardsPage] = useState(1);
  const pageSize = 10;
  const [cardStyle, setCardStyle] = useState<NonNullable<GymSettings['membershipCardStyle']>>({
    backgroundColor: '#f8f9fa',
    textColor: '#000000',
    accentColor: '#007bff',
    // Removed headerTitle, showGymName, showMemberEmail, showValidUntil, logoUrl, logoWidth, logoHeight
    backgroundOpacity: 1, // New: Default to 1 (fully opaque)
  } as any);
  
  // New state for sequential barcode generation
  const [barcodePrefix, setBarcodePrefix] = useState('G');
  const [startNumber, setStartNumber] = useState(1);
  const [numberOfCardsToGenerate, setNumberOfCardsToGenerate] = useState(10);

  const [frontStyle, setFrontStyle] = useState<NonNullable<GymSettings['membershipCardFront']>>({
    backgroundColor: '#ffffff',
    backgroundImage: '',
    patternImage: '',
    patternOpacity: 0.1,
    centerLogoUrl: '',
    centerLogoWidth: 120,
    centerLogoHeight: 120,
    showFrontDesign: false,
    showContactInfo: false, // New: show contact info (phone, address)
    contactInfoColor: '#333333', // New: color for contact info
    contactInfoFontSize: 8, // New: font size for contact info
    contactInfoLineHeight: 10, // New: line height for contact info
  } as any);

  // State for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<{
    // Removed logoUrl
    backgroundImage?: File; // Add for background image of the back of the card
    patternImage?: File;
    centerLogoUrl?: File;
  }>({});
  const [uploadedFrontFiles, setUploadedFrontFiles] = useState<{
    backgroundImage?: File;
  }>({});
  const gymSettingsService = new GymSettingsService();

  useEffect(() => {
    fetchUsers();
    fetchGeneratedCards();
    loadCardStyle();
  }, []);

  useEffect(() => {
    setUsersPage(1);
  }, [searchTerm, roleFilter, users]);

  useEffect(() => {
    setCardsPage(1);
  }, [generatedCards]);

  const loadCardStyle = async () => {
    try {
      const settings = await gymSettingsService.get();
      if ((settings as any).membershipCardStyle) {
        setCardStyle({ ...(settings as any).membershipCardStyle });
      }
      if ((settings as any).membershipCardFront) {
        setFrontStyle({ ...(settings as any).membershipCardFront });
      }
    } catch (e) {
      console.error('Failed to load card style', e);
    }
  };

  const handleFileUpload = (fieldName: string, file: File | null) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
      const previewUrl = URL.createObjectURL(file);
      if (fieldName === 'backgroundImage') {
        setCardStyle(prev => ({ ...prev, backgroundImage: previewUrl }));
      }
    } else {
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fieldName as keyof typeof newFiles];
        return newFiles;
      });
      if (fieldName === 'backgroundImage') {
        setCardStyle(prev => ({ ...prev, backgroundImage: '' }));
      }
    }
  };

  const handleFrontFileUpload = (fieldName: string, file: File | null) => {
    if (file) {
      setUploadedFrontFiles(prev => ({ ...prev, [fieldName]: file }));
      const previewUrl = URL.createObjectURL(file);
      if (fieldName === 'backgroundImage') {
        setFrontStyle(prev => ({ ...prev, backgroundImage: previewUrl }));
      }
    } else {
      setUploadedFrontFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fieldName as keyof typeof newFiles];
        return newFiles;
      });
      if (fieldName === 'backgroundImage') {
        setFrontStyle(prev => ({ ...prev, backgroundImage: '' }));
      }
    }
  };
  

  const saveCardStyle = async () => {
    try {
      const formData = new FormData();
      
      // Add the style data as JSON
      formData.append('membershipCardStyle', JSON.stringify(cardStyle));
      formData.append('membershipCardFront', JSON.stringify({
        ...frontStyle,
        showFrontDesign: String(frontStyle.showFrontDesign),
        showContactInfo: String(frontStyle.showContactInfo),
        contactInfoFontSize: String(frontStyle.contactInfoFontSize),
        contactInfoLineHeight: String(frontStyle.contactInfoLineHeight),
      }));
      
      // Add uploaded files
      if (uploadedFiles.backgroundImage) {
        formData.append('membershipCardBackgroundImage', uploadedFiles.backgroundImage);
      } else if (cardStyle.backgroundImage && typeof cardStyle.backgroundImage === 'string') {
        formData.append('membershipCardBackgroundImageUrl', cardStyle.backgroundImage);
      }

      if (uploadedFrontFiles.backgroundImage) {
        formData.append('backgroundImage', uploadedFrontFiles.backgroundImage);
      } else if (frontStyle.backgroundImage && typeof frontStyle.backgroundImage === 'string') {
        formData.append('backgroundImageUrl', frontStyle.backgroundImage);
      }

      if (uploadedFiles.patternImage) {
        formData.append('patternImage', uploadedFiles.patternImage);
      } else if (frontStyle.patternImage && typeof frontStyle.patternImage === 'string') {
        formData.append('patternImageUrl', frontStyle.patternImage);
      }

      if (uploadedFiles.centerLogoUrl) {
        formData.append('centerLogoUrl', uploadedFiles.centerLogoUrl);
      } else if (frontStyle.centerLogoUrl && typeof frontStyle.centerLogoUrl === 'string') {
        formData.append('centerLogoImageUrl', frontStyle.centerLogoUrl);
      }

      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/gym-settings`, {
        method: 'PUT',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل حفظ الإعدادات');
      }

      const result = await response.json();
      const updated = result.settings || result;
      
      setCardStyle({ ...(updated as any).membershipCardStyle });
      setFrontStyle({ ...(updated as any).membershipCardFront });
      
      // Clear uploaded files after successful save
      setUploadedFiles({});
      
      toast.success('تم حفظ إعدادات تصميم البطاقة');
    } catch (e) {
      console.error('Error saving card style:', e);
      toast.error('فشل حفظ إعدادات التصميم');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSequentialCards = async () => {
    if (!barcodePrefix.trim()) {
      toast.error('يرجى إدخال بادئة للباركود.');
      return;
    }
    if (startNumber <= 0) {
      toast.error('الرقم المبتدئ يجب أن يكون أكبر من صفر.');
      return;
    }
    if (numberOfCardsToGenerate <= 0) {
      toast.error('عدد الكروت للتوليد يجب أن يكون أكبر من صفر.');
      return;
    }

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
        fetchUsers(); // Refresh user list to reflect new barcodes
        // Update generated cards table with newly generated sequential cards
        if (result?.data?.results) {
          const newGeneratedCards: GeneratedCard[] = result.data.results.map(item => ({
            fileName: item.fileName, // Use item.fileName directly from the result
            filePath: item.filePath, // Use item.filePath directly from the result   // Correctly get userId from item.user.id
            barcode: item.barcode, // Ensure barcode is a string
            size: 0,     // Explicitly set to 0 to satisfy number type
            created: undefined,  // Explicitly set to undefined
          }));
          setGeneratedCards(prevCards => [...newGeneratedCards, ...prevCards]);
        }

        // Automatically download combined PDF if available
        if (result?.data?.combinedPdfBuffer && result?.data?.combinedPdfFileName) {
          const base64Pdf = result?.data?.combinedPdfBuffer;
          let byteCharacters: string = ''; // Initialize to empty string

          if (typeof base64Pdf === 'string') {
            try {
              byteCharacters = atob(base64Pdf);
            } catch (e) {
              console.error('Error decoding Base64 PDF buffer:', e);
              toast.error('فشل فك تشفير ملف PDF. تحقق من سجل المتصفح للمزيد من التفاصيل.');
              return; // Return early if decoding fails
            }
          } else {
            console.error('Base64 PDF buffer is not a string. Actual type:', typeof base64Pdf, 'Value:', base64Pdf);
            toast.error('خطأ في تنسيق ملف PDF المستلم. يرجى المحاولة مرة أخرى.');
            return; // Return early if base64Pdf is not a string
          }

          if (typeof byteCharacters !== 'string') {
            console.error('atob did not return a string or returned non-string. Actual type:', typeof byteCharacters, 'Value:', byteCharacters);
            toast.error('خطأ في تنسيق ملف PDF المستلم بعد فك التشفير. يرجى المحاولة مرة أخرى.');
            return;
          }

          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result?.data?.combinedPdfFileName; // Added optional chaining here
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('تم تحميل ملف PDF المجمع للباركودات المتسلسلة.');
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error generating sequential cards:', error);
      toast.error('حدث خطأ أثناء توليد الباركودات المتسلسلة');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchGeneratedCards = async () => {
    try {
      const data = await membershipCardService.getGeneratedCards();
      setGeneratedCards(data);
    } catch (error) {
      console.error('Error fetching generated cards:', error);
      // In production, this will be empty array
      setGeneratedCards([]);
    }
  };

  const generateSingleCard = async (userId: string) => {
    setIsGenerating(true);
    try {
      const blob = await membershipCardService.generateUserCard(userId);
      
      // Find user name for filename
      const user = users.find(u => u._id === userId);
      const userName = user ? user.name.replace(/[^a-zA-Z0-9]/g, '_') : userId;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `membership_card_${userName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Card generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating card:', error);
      toast.error('Error generating card');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDoubleSidedCard = async (userId: string) => {
    setIsGenerating(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/membership-cards/generate-double/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Card generation failed! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Find user name for filename
      const user = users.find(u => u._id === userId);
      const userName = user ? user.name.replace(/[^a-zA-Z0-9]/g, '_') : userId;
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `membership_card_double_${userName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Double-sided card generated and downloaded successfully');
    } catch (error) {
      console.error('Error generating double-sided card:', error);
      toast.error('Error generating double-sided card');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBatchCards = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to generate cards for');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await membershipCardService.generateBatchCards(selectedUsers);
      setGenerationResult(result as CardGenerationResult);
      setShowResults(true);
      
      if (result.success) {
        toast.success(`Generated ${result.data.totalGenerated} cards successfully`);
        fetchGeneratedCards();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error generating batch cards:', error);
      toast.error('Error generating batch cards');
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
      
      if (result.success) {
        toast.success(`Generated ${result.data.totalGenerated} cards successfully`);
        fetchGeneratedCards();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error generating all cards:', error);
      toast.error('Error generating all cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCard = async (fileName: string) => {
    try {
      const blob = await membershipCardService.downloadCard(fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Card downloaded successfully');
    } catch (error) {
      console.error('Error downloading card:', error);
      toast.error('Card not available in production environment');
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = term === '' || [
      user.name,
      user.email,
      user.barcode,
      user.phone,
      user.userNumber !== undefined && user.userNumber !== null ? String(user.userNumber) : ''
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((usersPage - 1) * pageSize, usersPage * pageSize);

  const totalCardPages = Math.max(1, Math.ceil(generatedCards.length / pageSize));
  const paginatedCards = generatedCards.slice((cardsPage - 1) * pageSize, cardsPage * pageSize);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 min-h-screen dark:text-gray-100 p-4 rounded-lg">
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
      <Card className="dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-200">
        <CardHeader className="dark:border-gray-700 border-gray-200">
          <CardTitle className="dark:text-gray-100 text-gray-900">توليد البطاقات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 dark:text-gray-100 text-gray-900">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={generateAllMemberCards}
              disabled={isGenerating}
              className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white bg-gray-600 text-white hover:bg-gray-700"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              <span>توليد بطاقات جميع الأعضاء</span>
            </Button>
 
            <Button
              onClick={async () => {
                if (selectedUsers.length === 0) {
                  toast.warning('اختر مستخدمين أولاً');
                  return;
                }
                try {
                  setIsGenerating(true);
                  const blob = await membershipCardService.downloadCombinedCards(selectedUsers);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `membership_cards_selected.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast.success('تم تحميل ملف PDF مجمع للمحددين');
                } catch (e) {
                  toast.error('فشل تحميل الملف المجمع');
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating || selectedUsers.length === 0}
              className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-green-700 dark:hover:bg-green-800 dark:text-white bg-green-600 text-white hover:bg-green-700"
            >
              <Download className="h-4 w-4" /> 
              <span>انشاء و تحميل  PDF للمحددين</span>
            </Button>
            <Button
              onClick={async () => {
                try {
                  setIsGenerating(true);
                  const blob = await membershipCardService.downloadCombinedCardsAll();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `membership_cards_all_members.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast.success('تم تحميل ملف PDF مجمع لكل الأعضاء');
                } catch (e) {
                  toast.error('فشل تحميل الملف المجمع');
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating}
              className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-green-700 dark:hover:bg-green-800 dark:text-white bg-green-600 text-white hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>تحميل PDF لجميع الأعضاء</span>
            </Button>
            <Button
              onClick={() => setGeneratedCards([])}
              disabled={generatedCards.length === 0}
              variant="destructive"
              className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-red-700 dark:hover:bg-red-800 dark:text-white bg-red-600 text-white hover:bg-red-700"
            >
              <XCircle className="h-4 w-4" />
              <span>مسح البطاقات التي تم إنشاؤها</span>
            </Button>
          </div>

          {/* New Section: Sequential Barcode Generation */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-4">
            <CardTitle className="dark:text-gray-100 text-gray-900">توليد باركودات متسلسلة</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm">بادئة الباركود (مثل G)</label>
                <Input
                  value={barcodePrefix}
                  onChange={(e) => setBarcodePrefix(e.target.value)}
                  className="mt-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="text-sm">الرقم المبتدئ</label>
                <Input
                  type="number"
                  value={String(startNumber)}
                  onChange={(e) => setStartNumber(Number(e.target.value))}
                  className="mt-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="text-sm">عدد الكروت للتوليد</label>
                <Input
                  type="number"
                  value={String(numberOfCardsToGenerate)}
                  onChange={(e) => setNumberOfCardsToGenerate(Number(e.target.value))}
                  className="mt-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
              </div>
            </div>
            <Button
              onClick={handleGenerateSequentialCards}
              disabled={isGenerating}
              className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white bg-gray-600 text-white hover:bg-gray-700"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4" />
              )}
              <span>توليد كروت بباركودات متسلسلة</span>
            </Button>
          </div>

          {generationResult && (
            <Alert className={generationResult.success ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200' : 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200'}>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {generationResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-300" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 dark:text-red-300" />
                )}
                <AlertDescription>
                  <strong>{generationResult.message}</strong>
                  <div className="mt-2 text-sm">
                    <p>تم التوليد: {generationResult?.data?.totalGenerated}</p>
                    <p>أخطاء: {generationResult?.data?.totalErrors}</p>
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Card Style Settings */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-200">
        <CardHeader className="dark:border-gray-700 border-gray-200">
          <CardTitle className="dark:text-gray-100 text-gray-900">إعدادات تصميم بطاقة العضوية (الظهر)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 dark:text-gray-100 text-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Removed header title input */}
            <div>
              <FileInput
                label="صورة الخلفية (Background Image)"
                currentFile={uploadedFiles.backgroundImage}
                currentUrl={cardStyle.backgroundImage} // Use the new backgroundImage field
                onChange={(file) => {
                  if (file) {
                    handleFileUpload('backgroundImage', file);
                  } else {
                    setCardStyle(prev => ({ ...prev, backgroundImage: '' }));
                    handleFileUpload('backgroundImage', null);
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm">شفافية الخلفية (0.0 - 1.0)</label> {/* New opacity input */}
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={Number(cardStyle.backgroundOpacity) || 0}
                onChange={(e) => setCardStyle({ ...cardStyle, backgroundOpacity: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <div>
              <label className="text-sm">لون الخلفية</label>
              <Input type="color" value={cardStyle.backgroundColor as any}
                onChange={(e) => setCardStyle({ ...cardStyle, backgroundColor: e.target.value })}
                className="mt-1 h-10 p-1"
              />
            </div>
            {/* Removed header color input */}
            <div>
              <label className="text-sm">لون النص</label>
              <Input type="color" value={cardStyle.textColor as any}
                onChange={(e) => setCardStyle({ ...cardStyle, textColor: e.target.value })}
                className="mt-1 h-10 p-1"
              />
            </div>
            {/* Removed logo file input and size inputs */}
            {/* Removed showMemberEmail and showValidUntil checkboxes */}
          </div>
        </CardContent>
      </Card>

      {/* Front Card Style Settings */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-200">
        <CardHeader className="dark:border-gray-700 border-gray-200">
          <CardTitle className="dark:text-gray-100 text-gray-900">إعدادات تصميم الوجه الأمامي للبطاقة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 dark:text-gray-100 text-gray-900">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
            <Checkbox checked={!!frontStyle.showFrontDesign} onCheckedChange={(v) => setFrontStyle({ ...frontStyle, showFrontDesign: !!v })} />
            <span className="text-sm font-medium">تفعيل تصميم الوجه الأمامي</span>
          </div>
          
          {frontStyle.showFrontDesign && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">لون الخلفية</label>
                <Input type="color" value={frontStyle.backgroundColor as any}
                  onChange={(e) => setFrontStyle({ ...frontStyle, backgroundColor: e.target.value })}
                  className="mt-1 h-10 p-1"
                />
              </div>
              <div>
                <FileInput
                  label="صورة الخلفية (Background Image)"
                  currentFile={uploadedFrontFiles.backgroundImage}
                  currentUrl={frontStyle.backgroundImage}
                  onChange={(file) => {
                    if (file) {
                      handleFrontFileUpload('backgroundImage', file);
                    } else {
                      setFrontStyle(prev => ({ ...prev, backgroundImage: '' }));
                      handleFrontFileUpload('backgroundImage', null);
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <FileInput
                  label="صورة الباترين (Pattern Image)"
                  currentFile={uploadedFiles.patternImage}
                  currentUrl={frontStyle.patternImage}
                  onChange={(file) => {
                    if (file) {
                      handleFileUpload('patternImage', file);
                    } else {
                      setFrontStyle(prev => ({ ...prev, patternImage: '' }));
                      handleFileUpload('patternImage', null);
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm">شفافية الباترين (0.0 - 1.0)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="1" 
                  value={Number(frontStyle.patternOpacity) as any}
                  onChange={(e) => setFrontStyle({ ...frontStyle, patternOpacity: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              <div>
                <FileInput
                  label="شعار الوسط (Center Logo)"
                  currentFile={uploadedFiles.centerLogoUrl}
                  currentUrl={frontStyle.centerLogoUrl}
                  onChange={(file) => {
                    if (file) {
                      handleFileUpload('centerLogoUrl', file);
                    } else {
                      setFrontStyle(prev => ({ ...prev, centerLogoUrl: '' }));
                      handleFileUpload('centerLogoUrl', null);
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm">عرض شعار الوسط</label>
                  <Input type="number" value={Number(frontStyle.centerLogoWidth) as any}
                    onChange={(e) => setFrontStyle({ ...frontStyle, centerLogoWidth: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm">ارتفاع شعار الوسط</label>
                  <Input type="number" value={Number(frontStyle.centerLogoHeight) as any}
                    onChange={(e) => setFrontStyle({ ...frontStyle, centerLogoHeight: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse md:col-span-2">
                <Checkbox checked={!!frontStyle.showContactInfo} onCheckedChange={(v) => setFrontStyle({ ...frontStyle, showContactInfo: !!v })} />
                <span className="text-sm font-medium">عرض معلومات التواصل (الهاتف، العنوان)</span>
              </div>
              {frontStyle.showContactInfo && (
                <>
                  <div>
                    <label className="text-sm">لون معلومات التواصل</label>
                    <Input type="color" value={frontStyle.contactInfoColor || '#333333'} onChange={(e) => setFrontStyle({ ...frontStyle, contactInfoColor: e.target.value })} className="mt-1 h-10 p-1" />
                  </div>
                  <div>
                    <label className="text-sm">حجم خط معلومات التواصل</label>
                    <Input type="number" value={String(Number(frontStyle.contactInfoFontSize) || 8)} onChange={(e) => setFrontStyle({ ...frontStyle, contactInfoFontSize: Number(e.target.value) })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm">ارتفاع سطر معلومات التواصل</label>
                    <Input type="number" value={String(Number(frontStyle.contactInfoLineHeight) || 10)} onChange={(e) => setFrontStyle({ ...frontStyle, contactInfoLineHeight: Number(e.target.value) })} className="mt-1" />
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={saveCardStyle} className="dark:bg-gray-700 dark:hover:bg-gray-800 bg-gray-600 text-white">حفظ الإعدادات</Button>
            <Button onClick={loadCardStyle} variant="outline">إعادة التحميل</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-200">
        <CardHeader className="dark:border-gray-700 border-gray-200">
          <CardTitle className="dark:text-gray-100 text-gray-900">المستخدمون</CardTitle>
          <div className="flex space-x-4 rtl:space-x-reverse">
            <Input
              placeholder="بحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 bg-white text-gray-900 border-gray-300"
            />
            <div className="w-48 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 bg-white text-gray-900 border-gray-300">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأدوار</SelectItem>
                  <SelectItem value="member">الأعضاء</SelectItem>
                  <SelectItem value="trainer">المدربين</SelectItem>
                  <SelectItem value="manager">المديرين</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="dark:text-gray-100 text-gray-900">
          <Table className="dark:bg-gray-900 bg-white dark:text-gray-100 text-gray-900">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 dark:text-gray-100 text-gray-700 dark:bg-gray-800 bg-gray-50">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="dark:text-gray-100 text-gray-700 dark:bg-gray-800 bg-gray-50">الاسم</TableHead>
                <TableHead className="dark:text-gray-100 text-gray-700 dark:bg-gray-800 bg-gray-50">البريد الإلكتروني</TableHead>
                <TableHead className="dark:text-gray-100 text-gray-700 dark:bg-gray-800 bg-gray-50">الباركود</TableHead>
                <TableHead className="dark:text-gray-100 text-gray-700 dark:bg-gray-800 bg-gray-50">الدور</TableHead>
                <TableHead className="dark:text-gray-100 text-gray-700 dark:bg-gray-800 bg-gray-50">الحالة</TableHead>
                <TableHead className="dark:text-gray-100 text-gray-700 dark:bg-gray-800 bg-gray-50">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="dark:text-gray-100 text-gray-900 dark:bg-gray-900 bg-white">
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onCheckedChange={(checked) => handleSelectUser(user._id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium dark:text-gray-100 text-gray-900 dark:bg-gray-900 bg-white">
                    <div>{user.name}</div>
                    {user.userNumber && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">رقم المستخدم: {user.userNumber}</div>
                    )}
                  </TableCell>
                  <TableCell className="dark:text-gray-100 text-gray-900 dark:bg-gray-900 bg-white">{user.email}</TableCell>
                  <TableCell className="dark:bg-gray-900 bg-white">
                    {user.barcode ? (
                      <Badge variant="outline" className="font-mono dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500 bg-gray-100 text-gray-900 border-gray-300">
                        {user.barcode}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">لا يوجد باركود</span>
                    )}
                  </TableCell>
                  <TableCell className="dark:bg-gray-900 bg-white">
                    <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-100 bg-gray-200 text-gray-900">{user.role === 'admin' ? 'إدارة' : user.role === 'manager' ? 'مدير' : user.role === 'trainer' ? 'مدرب' : 'عضو'}</Badge>
                  </TableCell>
                  <TableCell className="dark:bg-gray-900 bg-white">
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'dark:bg-green-700 dark:text-white bg-green-100 text-green-800' : 'dark:bg-red-700 dark:text-white bg-red-100 text-red-800'}>
                      {user.status === 'active' ? 'نشط' : user.status === 'inactive' ? 'غير نشط' : 'محظور'}
                    </Badge>
                  </TableCell>
                  <TableCell className="dark:bg-gray-900 bg-white">
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateSingleCard(user._id)}
                        disabled={isGenerating || !user.barcode}
                        className="px-2 py-1 text-sm dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white bg-gray-600 text-white hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        title="توليد الكارت (الظهر فقط)"
                      >
                        <User className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => generateDoubleSidedCard(user._id)}
                        disabled={isGenerating || !user.barcode}
                        className="px-2 py-1 text-sm dark:bg-green-700 dark:hover:bg-green-800 dark:text-white bg-green-600 text-white hover:bg-green-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        title="توليد الكارت المزدوج (وجه + ظهر)"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              الصفحة {usersPage} من {totalUserPages} — عرض {paginatedUsers.length} من {filteredUsers.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={usersPage === 1}
                onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                className="px-3 py-1"
              >السابق</Button>
              <Button
                variant="outline"
                disabled={usersPage === totalUserPages}
                onClick={() => setUsersPage(p => Math.min(totalUserPages, p + 1))}
                className="px-3 py-1"
              >التالي</Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Generation Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="relative max-w-4xl dark:bg-gray-800 bg-white dark:text-gray-100 text-gray-900">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowResults(false)}
            className="absolute top-3 right-3 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle>نتائج توليد البطاقات</DialogTitle>
            <DialogDescription>
              تفاصيل عملية توليد البطاقات
            </DialogDescription>
          </DialogHeader>
          {generationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {generationResult?.data?.totalGenerated}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-300">تم التوليد</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg dark:bg-red-900/20">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-300">
                    {generationResult?.data?.totalErrors}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-300">أخطاء</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-900/20">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                    {generationResult?.data?.totalRequested}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">المطلوب</div>
                </div>
              </div>

              {generationResult?.data?.errors?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-300 mb-2">الأخطاء:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {generationResult?.data?.errors?.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 rounded text-sm dark:bg-red-900/20 dark:text-red-200">
                        <strong>معرّف المستخدم:</strong> {error.userId} - {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Global alert for this page */}
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

