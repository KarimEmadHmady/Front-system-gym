import React from 'react';

interface FileInputProps {
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  accept?: string;
  className?: string;
  label?: string;
  currentFile?: File;
  currentUrl?: string;
}

const FileInput: React.FC<FileInputProps> = ({
  onChange,
  onRemove,
  accept = "image/*",
  className = "",
  label = "",
  currentFile,
  currentUrl,
}) => (
  <div className={`space-y-2 ${className}`}>
    {label && (
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
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
              {currentFile ? `تم اختيار: ${currentFile.name}` : ""}
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
            onClick={onRemove || (() => onChange(null))}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            إزالة
          </button>
        </div>
      )}
    </div>
  </div>
);

export default FileInput;
