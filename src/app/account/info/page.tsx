'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { FaUser, FaPhoneAlt, FaHome, FaSave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-md text-sm font-semibold ${
        type === 'success'
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-red-100 text-red-700 border border-red-300'
      }`}
      role="alert"
    >
      {type === 'success' ? <FaCheckCircle size={20} /> : <FaExclamationCircle size={20} />}
      <span>{message}</span>
    </div>
  );
}

export default function AccountInfoPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.push('/account');
      return;
    }
    const fetchUserInfo = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
      } catch {
        setError('Lấy thông tin thất bại');
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (!user) {
        setError('Bạn chưa đăng nhập');
        setSaving(false);
        return;
      }
      await setDoc(doc(db, 'users', user.uid), { name, phone, address }, { merge: true });
      setSuccessMessage('Lưu thông tin thành công!');
      // Ẩn thông báo sau 3 giây
      setTimeout(() => setSuccessMessage(null), 3000);
      // Tự động chuyển về trang chủ sau 1.5s để người dùng kịp nhìn thông báo
      setTimeout(() => router.push('/'), 1500);
    } catch {
      setError('Lưu thông tin thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Đang tải thông tin...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 space-y-8"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 flex items-center justify-center gap-3">
          <FaUser className="text-blue-600" /> Thông tin tài khoản
        </h2>

        {/* Thông báo lỗi hoặc thành công */}
        {error && <Alert type="error" message={error} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        {/* Name */}
        <div>
          <label className="block text-gray-700 mb-2 font-semibold">Họ và tên</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên"
              className="peer w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-700 mb-2 font-semibold">Số điện thoại</label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="peer w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-gray-700 mb-2 font-semibold">Địa chỉ</label>
          <div className="relative">
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ"
              rows={3}
              className="peer w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 text-gray-900 placeholder-gray-400 resize-none
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <FaHome className="absolute left-3 top-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl
            hover:from-purple-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <FaSave /> {saving ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </form>
    </div>
  );
}
