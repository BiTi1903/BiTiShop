'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  initialData?: Product | null;
  onSave: (data: Omit<Product, 'id'>) => Promise<void>;
}

export default function AddProductModal({
  isOpen,
  onClose,
  categories,
  initialData = null,
  onSave,
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    tiktokLink: '',
    shopeeLink: '',
    category: '',
    isNew: false,
    isSale: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price.toString(),
        description: initialData.description || '',
        image: initialData.image || '',
        tiktokLink: initialData.tiktokLink || '',
        shopeeLink: initialData.shopeeLink || '',
        category: initialData.category || '',
        isNew: initialData.isNew || false,
        isSale: initialData.isSale || false,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        description: '',
        image: '',
        tiktokLink: '',
        shopeeLink: '',
        category: '',
        isNew: false,
        isSale: false,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.category) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc (Tên, Giá, Danh mục)');
      return;
    }

    const productData: Omit<Product, 'id'> = {
      name: formData.name.trim(),
      price: parseInt(formData.price),
      description: formData.description.trim(),
      image: formData.image.trim(),
      tiktokLink: formData.tiktokLink.trim(),
      shopeeLink: formData.shopeeLink.trim(),
      category: formData.category,
      isNew: formData.isNew,
      isSale: formData.isSale,
    };

    await onSave(productData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl ring-1 ring-black ring-opacity-5">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 select-none">
            {initialData ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-400 hover:text-red-500 transition-colors duration-200 text-3xl leading-none select-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 select-none">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="Nhập tên sản phẩm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 select-none">
              Giá (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="Nhập giá sản phẩm"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 select-none">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="" disabled>
                -- Chọn danh mục --
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 select-none">
              Mô tả
            </label>
            <textarea
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition resize-none"
              rows={4}
              placeholder="Mô tả sản phẩm (không bắt buộc)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 select-none">
              Ảnh URL
            </label>
            <input
              type="url"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 select-none">
              Link TikTok
            </label>
            <input
              type="url"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="https://www.tiktok.com/@username/video/..."
              value={formData.tiktokLink}
              onChange={(e) => setFormData({ ...formData, tiktokLink: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 select-none">
              Link Shopee
            </label>
            <input
              type="url"
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="https://shopee.vn/product/..."
              value={formData.shopeeLink}
              onChange={(e) => setFormData({ ...formData, shopeeLink: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-8 mt-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
              />
              <span className="text-gray-700 font-semibold">Mới</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.isSale}
                onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
              />
              <span className="text-gray-700 font-semibold">Giảm giá</span>
            </label>
          </div>

          <div className="pt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-7 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 transition"
            >
              {initialData ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
