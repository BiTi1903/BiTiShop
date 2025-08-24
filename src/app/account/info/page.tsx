'use client';

import { useEffect, useState } from 'react';
import { auth, firestore } from '../../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { FaUser, FaPhoneAlt, FaHome, FaSave, FaCheckCircle, FaExclamationCircle, FaGoogle, FaFacebookF, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth';

interface UserInfo {
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
  name?: string;
  phone?: string;
  address?: string;
  createdAt?: FieldValue;
  lastLogin?: FieldValue;
  updatedAt?: FieldValue;
}

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

function ProviderIcon({ provider }: { provider: string }) {
  switch (provider) {
    case 'google':
      return <FaGoogle className="text-red-500" size={16} />;
    case 'facebook':
      return <FaFacebookF className="text-blue-600" size={16} />;
    default:
      return <FaEnvelope className="text-gray-500" size={16} />;
  }
}

export default function AccountInfoPage() {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [signingOut, setSigningOut] = useState<boolean>(false);
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
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserInfo;
          setUserInfo(data);
          setName(data.name || data.displayName || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        } else {
          // If document doesn't exist, create it with current user info
          const newUserData: UserInfo = {
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            provider: 'email',
            name: user.displayName || '',
            phone: user.phoneNumber || '',
            address: '',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          };
          
          await setDoc(docRef, newUserData);
          setUserInfo(newUserData);
          setName(newUserData.name || '');
          setPhone(newUserData.phone || '');
          setAddress(newUserData.address || '');
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError('Lấy thông tin thất bại');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user, router]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!user) {
        setError('Bạn chưa đăng nhập');
        return;
      }

      const updateData: Partial<UserInfo> = {
        name,
        phone,
        address,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(firestore, 'users', user.uid), updateData, { merge: true });
      setSuccessMessage('Lưu thông tin thành công!');
      
      // Update local userInfo state
      setUserInfo((prev: UserInfo | null) => {
        if (!prev) return updateData as UserInfo;
        return { ...prev, ...updateData };
      });
    } catch (err) {
      console.error('Error saving user info:', err);
      setError('Lưu thông tin thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(auth);
      router.push('/account');
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Đăng xuất thất bại');
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-gray-200 text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 px-4 py-2 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20">
          {/* Header with user avatar and info */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              {userInfo?.photoURL ? (
                <img
                  src={userInfo.photoURL}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg">
                  <FaUser size={24} className="text-white" />
                </div>
              )}
              
              {/* Provider badge */}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-md">
                <ProviderIcon provider={userInfo?.provider || 'email'} />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Thông tin tài khoản
            </h2>
            
            {/* Email display */}
            <div className="flex items-center justify-center gap-2 text-gray-300 mb-4">
              <FaEnvelope size={14} />
              <span className="text-sm">{user?.email}</span>
            </div>

            {/* Provider info */}
            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
              <span>Đăng nhập bằng:</span>
              <ProviderIcon provider={userInfo?.provider || 'email'} />
              <span className="capitalize">
                {userInfo?.provider === 'google' ? 'Google' : 
                 userInfo?.provider === 'facebook' ? 'Facebook' : 'Email'}
              </span>
            </div>
          </div>

          {/* Notifications */}
          {error && <Notification type="error" message={error} />}
          {successMessage && <Notification type="success" message={successMessage} />}

          <form onSubmit={handleSave} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-gray-200 mb-3 font-medium text-sm tracking-wide">
                Họ và tên
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 pl-12 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                />
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              </div>
              {userInfo?.displayName && userInfo.displayName !== name && (
                <p className="text-xs text-gray-400 mt-1">
                  Tên từ {userInfo.provider}: {userInfo.displayName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-200 mb-3 font-medium text-sm tracking-wide">
                Số điện thoại
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 pl-12 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                />
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-200 mb-3 font-medium text-sm tracking-wide">
                Địa chỉ
              </label>
              <div className="relative">
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ chi tiết"
                  rows={3}
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 pl-12 text-white placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                />
                <FaHome className="absolute left-4 top-4 text-gray-300" size={16} />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                saving
                  ? 'opacity-70 cursor-not-allowed animate-pulse'
                  : 'hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 active:scale-95'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <FaSave size={16} />
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thông tin'
                )}
              </span>
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className={`w-full bg-red-500/20 backdrop-blur-lg border border-red-400/30 text-red-300 py-4 rounded-2xl font-medium transition-all duration-300 hover:bg-red-500/30 hover:scale-105 active:scale-95 ${
                signingOut ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <FaSignOutAlt size={16} />
                {signingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin"></div>
                    Đang đăng xuất...
                  </>
                ) : (
                  'Đăng xuất'
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
            >
              ← Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}