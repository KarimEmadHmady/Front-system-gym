'use client';

import React from 'react';
import { QrCode, Loader2 } from 'lucide-react';
import { Button, Input } from './ui-primitives';

interface Props {
  barcodePrefix: string;
  startNumber: number;
  numberOfCardsToGenerate: number;
  isGenerating: boolean;
  onPrefixChange: (value: string) => void;
  onStartNumberChange: (value: number) => void;
  onCountChange: (value: number) => void;
  onGenerate: () => void;
}

export const SequentialBarcodeForm: React.FC<Props> = ({
  barcodePrefix,
  startNumber,
  numberOfCardsToGenerate,
  isGenerating,
  onPrefixChange,
  onStartNumberChange,
  onCountChange,
  onGenerate,
}) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-4">
      <h3 className="text-lg font-semibold dark:text-gray-100 text-gray-900">توليد باركودات متسلسلة</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm">بادئة الباركود (مثل G)</label>
          <Input
            value={barcodePrefix}
            onChange={(e) => onPrefixChange(e.target.value)}
            className="mt-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
          />
        </div>
        <div>
          <label className="text-sm">الرقم المبتدئ</label>
          <Input
            type="number"
            value={String(startNumber)}
            onChange={(e) => onStartNumberChange(Number(e.target.value))}
            className="mt-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
          />
        </div>
        <div>
          <label className="text-sm">عدد الكروت للتوليد</label>
          <Input
            type="number"
            value={String(numberOfCardsToGenerate)}
            onChange={(e) => onCountChange(Number(e.target.value))}
            className="mt-1 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
          />
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="flex gap-1 items-center space-x-2 rtl:space-x-reverse dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-white bg-gray-600 text-white hover:bg-gray-700"
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
        <span>توليد كروت بباركودات متسلسلة</span>
      </Button>
    </div>
  );
};