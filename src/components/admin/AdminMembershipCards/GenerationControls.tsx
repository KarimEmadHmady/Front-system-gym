'use client';

import React from 'react';
import { Users, Download, XCircle, Loader2, CheckCircle, XCircle as XCircleIcon } from 'lucide-react';
import { Button } from './ui-primitives';
import type { CardGenerationResult } from './types';

interface Props {
  isGenerating: boolean;
  selectedUsers: string[];
  generatedCards: { fileName: string }[];
  generationResult: CardGenerationResult | null;
  onGenerateAll: () => void;
  onDownloadSelected: () => void;
  onDownloadAll: () => void;
  onClearCards: () => void;
}

const Alert = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 rounded-md ${className}`}>{children}</div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

export const GenerationControls: React.FC<Props> = ({
  isGenerating,
  selectedUsers,
  generatedCards,
  generationResult,
  onGenerateAll,
  onDownloadSelected,
  onDownloadAll,
  onClearCards,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onGenerateAll}
          disabled={isGenerating}
          className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white bg-gray-600 text-white hover:bg-gray-700"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
          <span>توليد بطاقات جميع الأعضاء</span>
        </Button>

        <Button
          onClick={onDownloadSelected}
          disabled={isGenerating || selectedUsers.length === 0}
          className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-green-700 dark:hover:bg-green-800 dark:text-white bg-green-600 text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          <span>انشاء و تحميل PDF للمحددين</span>
        </Button>

        <Button
          onClick={onDownloadAll}
          disabled={isGenerating}
          className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-green-700 dark:hover:bg-green-800 dark:text-white bg-green-600 text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          <span>تحميل PDF لجميع الأعضاء</span>
        </Button>

        <Button
          onClick={onClearCards}
          disabled={generatedCards.length === 0}
          variant="destructive"
          className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-red-700 dark:hover:bg-red-800 dark:text-white bg-red-600 text-white hover:bg-red-700"
        >
          <XCircle className="h-4 w-4" />
          <span>مسح البطاقات التي تم إنشاؤها</span>
        </Button>
      </div>

      {generationResult && (
        <Alert
          className={
            generationResult.success
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200'
              : 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200'
          }
        >
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {generationResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-300" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500 dark:text-red-300" />
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
    </div>
  );
};