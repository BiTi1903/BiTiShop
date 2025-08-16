'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Order {
  id: string;
  orderId: string;
  customer: { name: string; phone: string; address: string };
  items: Array<{ id: string; name: string; image: string; price: number; quantity: number }>;
  total: number;
  createdAt: { seconds: number; nanoseconds: number };
  status?: string; // Thêm trạng thái đơn hàng (tùy chọn)
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const auth = getAuth();

  // Lấy lịch sử đơn hàng từ Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) {
        setOrders([]);
        return;
      }

      try {
        const ordersQuery = query(
          collection(db, `users/${user.uid}/orders`),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersList = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersList);
      } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
        setOrders([]);
      }
    };

    fetchOrders();
  }, [auth]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Định dạng ngày giờ thủ công
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (!auth.currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-100 to-rose-100 font-sans">
        <Header />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg text-center">
            <p className="text-7xl mb-4">🔐</p>
            <p className="text-xl font-semibold text-slate-700">Vui lòng đăng nhập để xem lịch sử đơn hàng</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-100 to-rose-100 font-sans">
      <Header />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
            📜 Lịch sử đặt hàng
          </span>
        </h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg text-center">
            <p className="text-7xl mb-4">📦</p>
            <p className="text-xl font-semibold text-slate-700">Bạn chưa đặt đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl transition-all duration-200 hover:shadow-2xl"
              >
                {/* Tiêu đề đơn hàng */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                      Đơn hàng #{order.orderId}
                    </h2>
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
                        order.status === 'Đã giao'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'Đang xử lý'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {order.status || 'Đã đặt'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{formatDate(order.createdAt)}</p>
                </div>

                {/* Thông tin đơn hàng */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  {/* Thông tin người nhận */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Thông tin người nhận</h3>
                    <div className="bg-slate-50/50 rounded-lg p-4 text-sm text-slate-600 space-y-1">
                      <p><span className="font-medium">Họ và tên:</span> {order.customer.name}</p>
                      <p><span className="font-medium">Số điện thoại:</span> {order.customer.phone}</p>
                      <p><span className="font-medium">Địa chỉ:</span> {order.customer.address}</p>
                    </div>
                  </div>

                  {/* Tổng tiền đơn hàng */}
                  <div className="flex items-end justify-end">
                    <div className="text-right">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">Tổng tiền</h3>
                      <p className="text-xl font-bold text-blue-600">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Sản phẩm</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center hover:bg-slate-50/50 transition-all duration-200 rounded-lg p-3"
                      >
                        {/* Ảnh + tên + giá */}
                        <div className="flex items-center gap-4 col-span-6">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg shadow-sm"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                            <p className="text-blue-600 font-semibold text-sm">{formatPrice(item.price)}</p>
                          </div>
                        </div>

                        {/* Số lượng */}
                        <div className="text-center text-slate-700 font-semibold text-sm col-span-3">
                          <span className="sm:hidden font-medium">Số lượng: </span>{item.quantity}
                        </div>

                        {/* Tổng giá sản phẩm */}
                        <div className="text-right text-blue-600 font-bold text-sm col-span-3">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}