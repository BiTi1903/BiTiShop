'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProductById } from '@/lib/api';
import { Product } from '@/types/product';
import { CartItem } from '../../types/cart';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc, addDoc, collection } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('id');
  const quantityParam = searchParams.get('qty');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editable, setEditable] = useState(false);

  const db = getFirestore(app);
  const auth = getAuth(app);

  // Load giỏ hàng hoặc sản phẩm mua ngay
  useEffect(() => {
    const loadCart = async () => {
      const storedCart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

      if (productId) {
        const product: Product | null = await getProductById(productId);
        if (product) {
          const qty = parseInt(quantityParam || '1');
          setCart([{ ...product, quantity: qty }]);
          return;
        }
      }

      setCart(storedCart);
    };

    loadCart();
  }, [productId, quantityParam]);

  // Lấy thông tin người dùng từ Firebase
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      }
    };

    fetchUserInfo();
  }, [auth, db]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!name || !phone || !address) {
      alert('Vui lòng nhập đầy đủ thông tin người nhận');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Vui lòng đăng nhập để đặt hàng');
      return;
    }

    // Tạo mã đơn hàng (kết hợp timestamp và một phần UID)
    const timestamp = new Date().getTime();
    const shortUid = user.uid.slice(0, 8);
    const orderId = `ORD-${timestamp}-${shortUid}`;

    const order = {
      orderId, // Lưu mã đơn hàng
      customer: { name, phone, address },
      items: cart,
      total: totalPrice,
      createdAt: new Date(),
    };

    try {
      // Lưu đơn hàng vào Firestore
      await addDoc(collection(db, `users/${user.uid}/orders`), order);
      console.log('Đơn hàng:', order);
      alert('Đặt hàng thành công!');

      if (!productId) {
        localStorage.removeItem('cart');
      }

      setCart([]);
      router.push('/account/user/orderid');
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      alert('Có lỗi xảy ra khi đặt hàng');
    }
  };

  // Lưu thông tin người dùng vào Firebase
  const handleSaveInfo = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Vui lòng đăng nhập để lưu thông tin');
      return;
    }

    if (!name || !phone || !address) {
      alert('Vui lòng nhập đầy đủ thông tin trước khi lưu');
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), { name, phone, address }, { merge: true });
      alert('Lưu thông tin thành công!');
      setEditable(false);
    } catch (error) {
      console.error('Lỗi khi lưu thông tin:', error);
      alert('Có lỗi xảy ra khi lưu thông tin');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-blue-100 to-rose-100">
        <Header />
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg text-center">
          <p className="text-7xl mb-4">🛒</p>
          <p className="text-xl font-semibold text-slate-700">Giỏ hàng của bạn đang trống</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-100 to-rose-100 font-sans">
      <Header />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Thanh toán</span>
        </h1>

        {/* Danh sách sản phẩm */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl">
          {/* Tiêu đề cột */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-4 border-b border-slate-200 pb-4 mb-4 text-sm font-semibold text-slate-600">
            <span>Sản phẩm</span>
            <span className="text-center">Số lượng</span>
            <span className="text-right">Tổng giá</span>
          </div>

          {cart.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center border-b border-slate-200 py-4 last:border-b-0 hover:bg-slate-50/50 transition-all duration-200 rounded-lg"
            >
              {/* Ảnh + Tên sản phẩm + Giá đơn vị */}
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
                />
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{item.name}</h2>
                  <p className="text-blue-600 font-semibold text-sm mt-1">{formatPrice(item.price)}</p>
                </div>
              </div>

              {/* Số lượng (giữa, chỉ hiển thị) */}
              <div className="text-center text-slate-700 font-semibold text-sm sm:text-base">
                <span className="sm:hidden">Số lượng: </span>{item.quantity}
              </div>

              {/* Tổng giá sản phẩm */}
              <div className="text-right text-blue-600 font-bold text-sm sm:text-base">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
          <div className="text-right text-lg sm:text-xl font-bold text-slate-900 mt-6">
            Tổng tiền: {formatPrice(totalPrice)}
          </div>
        </div>

        {/* Thông tin người nhận */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Thông tin người nhận</h2>
            <div className="flex items-center gap-3">
              {editable ? (
                <>
                  <button
                    onClick={handleSaveInfo}
                    className="text-sm bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
                  >
                    Lưu thông tin
                  </button>
                  <button
                    onClick={() => setEditable(false)}
                    className="text-sm bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditable(true)}
                  className="text-sm bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-4 py-2 rounded-xl shadow-md transition-all duration-200 hover:scale-105"
                >
                  Đổi thông tin
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-slate-700 font-medium mb-2">Họ và tên</label>
              <input
                type="text"
                value={name}
                readOnly={!editable}
                onChange={(e) => setName(e.target.value)}
                className={`px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm outline-none shadow-sm transition-all duration-200 focus:ring-2 focus:ring-teal-500 ${
                  editable ? 'text-slate-900' : 'text-slate-600 bg-slate-100 cursor-not-allowed'
                }`}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-slate-700 font-medium mb-2">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                readOnly={!editable}
                onChange={(e) => setPhone(e.target.value)}
                className={`px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm outline-none shadow-sm transition-all duration-200 focus:ring-2 focus:ring-teal-500 ${
                  editable ? 'text-slate-900' : 'text-slate-600 bg-slate-100 cursor-not-allowed'
                }`}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-slate-700 font-medium mb-2">Địa chỉ nhận hàng</label>
              <input
                type="text"
                value={address}
                readOnly={!editable}
                onChange={(e) => setAddress(e.target.value)}
                className={`px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm outline-none shadow-sm transition-all duration-200 focus:ring-2 focus:ring-teal-500 ${
                  editable ? 'text-slate-900' : 'text-slate-600 bg-slate-100 cursor-not-allowed'
                }`}
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={editable}
            className={`w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 ${
              editable ? 'opacity-50 cursor-not-allowed' : 'hover:from-emerald-600 hover:to-teal-700'
            }`}
          >
            Đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
}