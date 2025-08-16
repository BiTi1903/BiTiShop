'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { FaUser, FaPhoneAlt, FaHome, FaSave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function Notification({
  type,
  message,
}: {
  type: 'success' | 'error';
  message: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium mb-6 backdrop-blur-lg border transform transition-all duration-500 ease-out animate-pulse ${
        type === 'success'
          ? 'bg-gradient-to-r from-emerald-50/90 to-green-50/90 text-emerald-700 border-emerald-200 shadow-lg shadow-emerald-500/20'
          : 'bg-gradient-to-r from-red-50/90 to-rose-50/90 text-red-700 border-red-200 shadow-lg shadow-red-500/20'
      }`}
      role="alert"
    >
      <div className={`p-1 rounded-full ${type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
        {type === 'success' ? (
          <FaCheckCircle size={16} className="text-emerald-600" />
        ) : (
          <FaExclamationCircle size={16} className="text-red-600" />
        )}
      </div>
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
      setTimeout(() => setSuccessMessage(null), 3000);
      setTimeout(() => router.push('/'), 1500);
    } catch {
      setError('Lưu thông tin thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <p className="text-gray-200 text-lg">Đang tải thông tin...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 px-4 py-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <form
        onSubmit={handleSave}
        className="relative z-10 backdrop-blur-xl bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-white flex items-center justify-center gap-3">
          <FaUser className="text-blue-400" /> Thông tin tài khoản
        </h2>

        {error && <Notification type="error" message={error} />}
        {successMessage && <Notification type="success" message={successMessage} />}

        {/* Name */}
        <div>
          <label className="block text-gray-200 mb-2 font-semibold">Họ và tên</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên"
              className="peer w-full rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-3 pl-11 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-200 mb-2 font-semibold">Số điện thoại</label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="peer w-full rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-3 pl-11 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-gray-200 mb-2 font-semibold">Địa chỉ</label>
          <div className="relative">
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ"
              rows={3}
              className="peer w-full rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-3 pl-11 text-white placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            <FaHome className="absolute left-3 top-4 text-gray-300" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold py-3 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
            saving
              ? 'opacity-70 cursor-not-allowed animate-pulse'
              : 'hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 active:scale-95'
          }`}
        >
          <FaSave /> {saving ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </form>
    </div>
  );
}
