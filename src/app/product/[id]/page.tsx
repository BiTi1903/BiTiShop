'use client';
import Link from 'next/link';

import { useEffect, useState, Fragment } from 'react';
import Header from '../../../components/Header';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { getProductById } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'description' | 'specs'>('description');
  const [related, setRelated] = useState<Product[]>([]);

  // Firebase user
  const [user] = useAuthState(auth);

  // Hệ thống đánh giá
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [editingRating, setEditingRating] = useState(false); // trạng thái sửa đánh giá

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    getProductById(productId)
      .then((p) => {
        if (p) setProduct(p);
        else alert('Không tìm thấy sản phẩm');
      })
      .finally(() => setLoading(false));

    setRelated([]);
  }, [productId]);

  // Load đánh giá
  const fetchRatings = async () => {
    if (!productId) return;
    const docRef = doc(db, "productRatings", productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const allRatings: number[] = data.ratings || [];
      setReviewCount(allRatings.length);
      setAvgRating(allRatings.length ? allRatings.reduce((a,b)=>a+b,0)/allRatings.length : 0);

      if (user && data.userRatings?.[user.uid]) {
        setSelectedRating(data.userRatings[user.uid]);
      }
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [productId, user]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
const index = cart.findIndex((item: Product) => item.id === product.id);

    if (index >= 0) {
      cart[index].quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    alert(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
  };

  // Submit đánh giá
  const handleRate = async (rating: number) => {
    if (!user) { alert("Vui lòng đăng nhập để đánh giá"); return; }
    if (!productId) return;

    const docRef = doc(db, "productRatings", productId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        ratings: [rating],
        userRatings: { [user.uid]: rating }
      });
    } else {
      const data = docSnap.data();
      if (data.userRatings?.[user.uid]) {
        if (!editingRating) {
          alert("Bạn đã đánh giá sản phẩm này rồi!");
          return;
        }
        // Sửa đánh giá
        const oldRating = data.userRatings[user.uid];
        const newRatings = data.ratings.map((r: number) => r === oldRating ? rating : r);
        await updateDoc(docRef, {
          ratings: newRatings,
          [`userRatings.${user.uid}`]: rating
        });
      } else {
        await updateDoc(docRef, {
          ratings: arrayUnion(rating),
          [`userRatings.${user.uid}`]: rating
        });
      }
    }

    setSelectedRating(rating);
    setEditingRating(false);
    setShowRatingModal(false);
    fetchRatings();
  };

  // Handle "Mua ngay" button click
  const handleBuyNow = () => {
    if (!product) return;
    router.push(`/checkout?id=${product.id}&qty=${quantity}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin w-16 h-16 border-4 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full mx-auto animate-pulse"></div>
        </div>
        <p className="text-slate-700 text-lg font-medium">Đang tải sản phẩm...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <p className="text-red-600 text-xl font-semibold">Không tìm thấy sản phẩm</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-600">
          <ol className="flex items-center space-x-2">
<li>
  <Link href="/" className="hover:text-blue-600 transition-colors cursor-pointer">
    Trang chủ
  </Link>
</li>            <li className="text-slate-400">/</li>
            <li><a href="/products" className="hover:text-blue-600 transition-colors cursor-pointer">Sản phẩm</a></li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-900 font-medium truncate">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-5">
          {/* Hình ảnh sản phẩm */}
          <div className="space-y-4">
            <div className="relative group bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 cursor-pointer">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[400px] sm:h-[500px] object-cover transition-all duration-700 hover:scale-105 cursor-pointer"
                />

                {/* Tags overlay */}
                <div className="absolute top-4 left-4 space-y-2">
                  {product.isNew && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-lg cursor-pointer">
                      <span className="mr-1">✨</span> NEW
                    </span>
                  )}
                  {product.isSale && product.originalPrice && product.originalPrice > product.price && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg cursor-pointer">
                      <span className="mr-1">🔥</span> 
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl">
              <div className="space-y-2 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">{product.name}</h1>
                
                {/* Ngôi sao đánh giá trung bình */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium text-slate-700">Trung bình:</span>
                  {Array.from({ length: 5 }, (_, i) => {
                    const starIndex = i + 1;
                    return (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          starIndex <= Math.round(avgRating)
                            ? 'fill-yellow-400 stroke-yellow-400'
                            : 'fill-none stroke-yellow-400'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <polygon points="10 1.5 12.5 7.5 19 8 14 12 15.5 18 10 15 4.5 18 6 12 1 8 7.5 7.5" />
                      </svg>
                    );
                  })}
                  <span className="text-sm text-slate-500">({reviewCount})</span>

                  {/* Chữ Đánh giá bên cạnh số lượt đánh giá */}
                  <span
                    className="text-blue-600 text-sm font-semibold underline cursor-pointer"
                    onClick={() => {
                      if (!user) { 
                        alert("Vui lòng đăng nhập để đánh giá"); 
                        return; 
                      }

                      if (selectedRating) {
                        if (confirm(`Bạn đã đánh giá sản phẩm này ${selectedRating} sao. Bạn có muốn sửa đánh giá?`)) {
                          setEditingRating(true);
                          setShowRatingModal(true);
                        }
                      } else {
                        setEditingRating(false);
                        setShowRatingModal(true);
                      }
                    }}
                  >
                    Đánh giá
                  </span>
                </div>

              </div>

              {/* Giá */}
              <div className="mb-6">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-2xl text-red-500">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className=" text-xl text-slate-500 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                {product.isSale && product.originalPrice && (
                  <p className="text-emerald-600 font-normal">Tiết kiệm {formatPrice(product.originalPrice - product.price)}</p>
                )}
              </div>

              {/* Form thêm vào giỏ */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">Số lượng</label>
                  <div className="text-black flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all duration-200 active:scale-95 cursor-pointer"
                    >−</button>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      readOnly
                      className="w-20 h-12 text-center border-2 border-slate-200 rounded-xl font-semibold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 active:scale-95 shadow-lg cursor-pointer"
                    >+</button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <button type="submit" className="group relative overflow-hidden px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer">Thêm vào giỏ</button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="group relative overflow-hidden px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] text-center cursor-pointer"
                  >Mua ngay</button>
                </div>
              </form>
            </div>            
          </div>
          
        </div>
        {/*Mô tả / Thông số */}
<div className="w-full bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl mt-5 mb-12">
  <div className="max-w-7xl mx-auto">
    <div className="flex gap-6 mb-4 border-b border-slate-200">
      <button
        className={`pb-2 ${tab === 'description' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-slate-600'} cursor-pointer`}
        onClick={() => setTab('description')}
      >
        Mô tả
      </button>
      <button
        className={`pb-2 ${tab === 'specs' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-slate-600'} cursor-pointer`}
        onClick={() => setTab('specs')}
      >
        Thông số
      </button>
    </div>
    {tab === 'description' && <p className="text-slate-700">{product.description || 'Chưa có mô tả.'}</p>}
    {tab === 'specs' && product.details?.length ? (
      <div className="grid gap-3">
        {product.details.map((d, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <h3 className="font-semibold text-slate-800">{d.mainCategory}</h3>
            <ul className="list-disc pl-5 text-slate-700">
              {d.subCategory?.split(',').map((s, idx) => <li key={idx}>{s.trim()}</li>)}
            </ul>
          </div>
        ))}
      </div>
    ) : tab === 'specs' ? <p className="text-slate-500 italic">Chưa có thông tin kỹ thuật</p> : null}
  </div>
</div>

        {/* Sản phẩm liên quan */}
            {related.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Sản phẩm liên quan</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {related.map(r => <ProductCard key={r.id} product={r} />)}
                </div>
              </div>
            )}
      </div>

      {/* Modal đánh giá */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 text-center">
            <h2 className="text-black text-lg font-semibold mb-4">Chọn số sao đánh giá</h2>
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: 5 }, (_, i) => {
                const starIndex = i + 1;
                return (
                  <svg
                    key={i}
                    onClick={() => setSelectedRating(starIndex)}
                    className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                      starIndex <= selectedRating ? 'fill-yellow-400 stroke-yellow-400' : 'fill-none stroke-yellow-400'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <polygon points="10 1.5 12.5 7.5 19 8 14 12 15.5 18 10 15 4.5 18 6 12 1 8 7.5 7.5" />
                  </svg>
                );
              })}
            </div>
            <button
              onClick={() => handleRate(selectedRating)}
              className="px-6 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200 font-semibold"
            >
              {editingRating ? "Cập nhật đánh giá" : "Đánh giá"}
            </button>
            <button
              onClick={() => setShowRatingModal(false)}
              className="ml-4 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-all duration-200"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}