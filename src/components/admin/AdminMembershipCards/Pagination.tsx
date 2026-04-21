'use client';

import React from 'react';
import { Button } from './ui-primitives';

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  visibleCount: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  totalItems,
  visibleCount,
  onPageChange,
}) => (
  <div className="flex items-center justify-between mt-4">
    <div className="text-sm text-gray-600 dark:text-gray-300">
      الصفحة {currentPage} من {totalPages} — عرض {visibleCount} من {totalItems}
    </div>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="px-3 py-1"
      >
        السابق
      </Button>
      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="px-3 py-1"
      >
        التالي
      </Button>
    </div>
  </div>
);