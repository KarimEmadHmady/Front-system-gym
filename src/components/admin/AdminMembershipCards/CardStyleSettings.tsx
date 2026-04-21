'use client';

import React from 'react';
import { Button, Input } from './ui-primitives';
import { FileInput } from './FileInput';
import type { CardStyleType, UploadedFiles } from './types';

interface Props {
  cardStyle: CardStyleType;
  uploadedFiles: UploadedFiles;
  onStyleChange: (style: CardStyleType) => void;
  onFileUpload: (fieldName: string, file: File | null) => void;
  onSave: () => void;
  onReload: () => void;
}

export const CardStyleSettings: React.FC<Props> = ({
  cardStyle,
  uploadedFiles,
  onStyleChange,
  onFileUpload,
  onSave,
  onReload,
}) => {
  return (
    <div className="space-y-4 dark:text-gray-100 text-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FileInput
            label="صورة الخلفية (Background Image)"
            currentFile={uploadedFiles.backgroundImage}
            currentUrl={cardStyle.backgroundImage as string | undefined}
            onChange={(file) => {
              if (file) {
                onFileUpload('backgroundImage', file);
              } else {
                onStyleChange({ ...cardStyle, backgroundImage: '' } as CardStyleType);
                onFileUpload('backgroundImage', null);
              }
            }}
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm">شفافية الخلفية (0.0 - 1.0)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={Number((cardStyle as any).backgroundOpacity) || 0}
            onChange={(e) =>
              onStyleChange({ ...cardStyle, backgroundOpacity: Number(e.target.value) } as CardStyleType)
            }
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        <div>
          <label className="text-sm">لون الخلفية</label>
          <Input
            type="color"
            value={cardStyle.backgroundColor as string}
            onChange={(e) => onStyleChange({ ...cardStyle, backgroundColor: e.target.value })}
            className="mt-1 h-10 p-1"
          />
        </div>

        <div>
          <label className="text-sm">لون النص</label>
          <Input
            type="color"
            value={cardStyle.textColor as string}
            onChange={(e) => onStyleChange({ ...cardStyle, textColor: e.target.value })}
            className="mt-1 h-10 p-1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onSave}
          className="dark:bg-gray-700 dark:hover:bg-gray-800 bg-gray-600 text-white"
        >
          حفظ الإعدادات
        </Button>
        <Button onClick={onReload} variant="outline">
          إعادة التحميل
        </Button>
      </div>
    </div>
  );
};