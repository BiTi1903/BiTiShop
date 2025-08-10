'use client';

import React from 'react';

interface DeleteProductButtonProps {
  productId: string;
  onDelete: (id: string) => Promise<void>;
}

export default function DeleteProductButton({ productId, onDelete }: DeleteProductButtonProps) {
  const handleClick = () => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      onDelete(productId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
    >
      🗑️ Xóa
    </button>
  );
}
