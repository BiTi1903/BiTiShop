// ProductDetailModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Đường dẫn tới config Firebase của bạn

interface DetailItem {
  mainCategory: string;
  subCategory: string;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProductId: string;
  onSave: (productId: string, details: DetailItem[]) => void; // vẫn dùng để update local state
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  products,
  initialProductId,
  onSave,
}: ProductDetailModalProps) {
  const [details, setDetails] = useState<DetailItem[]>([]);

  const product = products.find((p) => p.id === initialProductId);

  useEffect(() => {
    if (!initialProductId) return;
    setDetails(
      product?.details?.length ? product.details : [{ mainCategory: '', subCategory: '' }]
    );
  }, [initialProductId, products]);

  if (!isOpen) return null;

  const handleAddDetail = () =>
    setDetails([...details, { mainCategory: '', subCategory: '' }]);

  const handleChange = (index: number, field: keyof DetailItem, value: string) => {
    const updated = [...details];
    updated[index][field] = value;
    setDetails(updated);
  };

  const handleRemove = (index: number) => {
    const updated = [...details];
    updated.splice(index, 1);
    setDetails(updated);
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      // Lưu lên Firestore
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, { details });

      // Cập nhật local state
      onSave(product.id, details);

      alert('Cập nhật chi tiết sản phẩm thành công!');
      onClose();
    } catch (err) {
      console.error('Lỗi khi cập nhật Firestore:', err);
      alert('Cập nhật thất bại. Thử lại sau.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 md:p-8 animate-fadeIn">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Chi tiết sản phẩm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tên sản phẩm */}
        <div className="bg-gray-100 rounded-lg p-3 mb-4 text-center font-semibold text-gray-700 text-lg">
          {product?.name || 'Không xác định'}
        </div>

        {/* Bảng chi tiết */}
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-gray-600">Mục lớn</th>
              <th className="p-3 text-left text-gray-600">Mục nhỏ</th>
              <th className="p-3 text-center text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {details.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="p-2">
                  <input
                    type="text"
                    value={item.mainCategory}
                    onChange={(e) => handleChange(index, 'mainCategory', e.target.value)}
                    className="text-black w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập mục lớn"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={item.subCategory}
                    onChange={(e) => handleChange(index, 'subCategory', e.target.value)}
                    className="text-black w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập mục nhỏ"
                  />
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleRemove(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Thêm dòng */}
        <button
          onClick={handleAddDetail}
          className="w-full mb-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          ➕ Thêm dòng
        </button>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
