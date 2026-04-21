'use client';

import React from 'react';
import { Button, Input, Checkbox } from './ui-primitives';
import { FileInput } from './FileInput';
import type { FrontStyleType, UploadedFiles } from './types';

interface Props {
  frontStyle: FrontStyleType;
  uploadedFiles: UploadedFiles;
  uploadedFrontFiles: { backgroundImage?: File };
  onStyleChange: (style: FrontStyleType) => void;
  onFileUpload: (fieldName: string, file: File | null) => void;
  onFrontFileUpload: (fieldName: string, file: File | null) => void;
  onSave: () => void;
  onReload: () => void;
}

export const FrontCardStyleSettings: React.FC<Props> = ({
  frontStyle,
  uploadedFiles,
  uploadedFrontFiles,
  onStyleChange,
  onFileUpload,
  onFrontFileUpload,
  onSave,
  onReload,
}) => {
  return (
    <div className="space-y-4 dark:text-gray-100 text-gray-900">
      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
        <Checkbox
          checked={!!frontStyle.showFrontDesign}
          onCheckedChange={(v) => onStyleChange({ ...frontStyle, showFrontDesign: !!v })}
        />
        <span className="text-sm font-medium">تفعيل تصميم الوجه الأمامي</span>
      </div>

      {frontStyle.showFrontDesign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">لون الخلفية</label>
            <Input
              type="color"
              value={frontStyle.backgroundColor as string}
              onChange={(e) => onStyleChange({ ...frontStyle, backgroundColor: e.target.value })}
              className="mt-1 h-10 p-1"
            />
          </div>

          <div>
            <FileInput
              label="صورة الخلفية (Background Image)"
              currentFile={uploadedFrontFiles.backgroundImage}
              currentUrl={frontStyle.backgroundImage as string | undefined}
              onChange={(file) => {
                if (file) {
                  onFrontFileUpload('backgroundImage', file);
                } else {
                  onStyleChange({ ...frontStyle, backgroundImage: '' } as FrontStyleType);
                  onFrontFileUpload('backgroundImage', null);
                }
              }}
              className="mt-1"
            />
          </div>

          <div>
            <FileInput
              label="صورة الباترين (Pattern Image)"
              currentFile={uploadedFiles.patternImage}
              currentUrl={frontStyle.patternImage as string | undefined}
              onChange={(file) => {
                if (file) {
                  onFileUpload('patternImage', file);
                } else {
                  onStyleChange({ ...frontStyle, patternImage: '' } as FrontStyleType);
                  onFileUpload('patternImage', null);
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
              onChange={(e) => onStyleChange({ ...frontStyle, patternOpacity: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>

          <div>
            <FileInput
              label="شعار الوسط (Center Logo)"
              currentFile={uploadedFiles.centerLogoUrl}
              currentUrl={frontStyle.centerLogoUrl as string | undefined}
              onChange={(file) => {
                if (file) {
                  onFileUpload('centerLogoUrl', file);
                } else {
                  onStyleChange({ ...frontStyle, centerLogoUrl: '' } as FrontStyleType);
                  onFileUpload('centerLogoUrl', null);
                }
              }}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm">عرض شعار الوسط</label>
              <Input
                type="number"
                value={Number(frontStyle.centerLogoWidth) as any}
                onChange={(e) => onStyleChange({ ...frontStyle, centerLogoWidth: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm">ارتفاع شعار الوسط</label>
              <Input
                type="number"
                value={Number(frontStyle.centerLogoHeight) as any}
                onChange={(e) => onStyleChange({ ...frontStyle, centerLogoHeight: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse md:col-span-2">
            <Checkbox
              checked={!!frontStyle.showContactInfo}
              onCheckedChange={(v) => onStyleChange({ ...frontStyle, showContactInfo: !!v })}
            />
            <span className="text-sm font-medium">عرض معلومات التواصل (الهاتف، العنوان)</span>
          </div>

          {frontStyle.showContactInfo && (
            <>
              <div>
                <label className="text-sm">لون معلومات التواصل</label>
                <Input
                  type="color"
                  value={(frontStyle.contactInfoColor as string) || '#333333'}
                  onChange={(e) => onStyleChange({ ...frontStyle, contactInfoColor: e.target.value })}
                  className="mt-1 h-10 p-1"
                />
              </div>
              <div>
                <label className="text-sm">حجم خط معلومات التواصل</label>
                <Input
                  type="number"
                  value={String(Number(frontStyle.contactInfoFontSize) || 8)}
                  onChange={(e) =>
                    onStyleChange({ ...frontStyle, contactInfoFontSize: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm">ارتفاع سطر معلومات التواصل</label>
                <Input
                  type="number"
                  value={String(Number(frontStyle.contactInfoLineHeight) || 10)}
                  onChange={(e) =>
                    onStyleChange({ ...frontStyle, contactInfoLineHeight: Number(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={onSave} className="dark:bg-gray-700 dark:hover:bg-gray-800 bg-gray-600 text-white">
          حفظ الإعدادات
        </Button>
        <Button onClick={onReload} variant="outline">
          إعادة التحميل
        </Button>
      </div>
    </div>
  );
};