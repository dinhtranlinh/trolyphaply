'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface DeleteConfirmDialogProps {
  open: boolean;
  promptTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting?: boolean;
}

export default function DeleteConfirmDialog({
  open,
  promptTitle,
  onConfirm,
  onCancel,
  deleting = false,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Xác nhận xóa prompt
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 mb-1">
            Bạn có chắc chắn muốn xóa prompt này?
          </p>
          <p className="text-sm font-medium text-gray-900 mb-6">
            "{promptTitle}"
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-yellow-800">
              ⚠️ Hành động này không thể hoàn tác. Prompt sẽ bị xóa vĩnh viễn.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={onCancel}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={onConfirm}
              loading={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Đang xóa...' : 'Xóa prompt'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
