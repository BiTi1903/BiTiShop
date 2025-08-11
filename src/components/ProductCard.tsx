// components/ProductCard.tsx
import { Product } from '../types/product';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onBuyNow }: ProductCardProps) {
  const [showToast, setShowToast] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      // Hiển thị toast notification
      setShowToast(true);
      // Tự động ẩn sau 3 giây
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      const url = product.shopeeLink || `https://shopee.vn/search?keyword=${encodeURIComponent(product.name)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 flex flex-col">
        {/* Hình ảnh */}
        <div className="relative overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-6xl">📦</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                NEW
              </span>
            )}
            {product.isSale && discountPercent > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                -{discountPercent}%
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition">❤️</button>
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition">👁️</button>
          </div>
        </div>

        {/* Nội dung */}
        <div className="p-4 flex flex-col flex-1">
          {/* Tên & mô tả - chiều cao cố định */}
          <div className="mb-1 h-[96px]">
            <h3 className=" text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-[12px] text-gray-600 mt-1 line-clamp-2">
              {product.description || 'Chưa có mô tả'}
            </p>
          </div>

          {/* Giá */}
          <div className="mb-4 flex flex-col">
            <span className="text-xl font-bold text-red-500">{formatPrice(product.price)}</span>

            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through mt-1">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Link TikTok & Shopee - chiều cao cố định */}
          <div className="flex gap-2 mb-6 flex-wrap h-[40px]">
            {product.tiktokLink && (
              <a
                href={product.tiktokLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
              >
                🎵 TikTok
              </a>
            )}
            {product.shopeeLink && (
              <a
                href={product.shopeeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
              >
                🛒 Shopee
              </a>
            )}
          </div>

          {/* Nút bấm */}
          <div className="flex flex-col space-y-2 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
            >
              Thêm vào giỏ
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[320px] transform transition-all duration-500 ease-out">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Thành công!</p>
              <p className="text-xs opacity-90">Đã thêm &quot;{product.name}&quot; vào giỏ hàng</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
