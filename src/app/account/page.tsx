'use client';

import { useState, useEffect } from 'react';
import { auth, firestore } from '../../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, getDoc, FieldValue } from 'firebase/firestore';
import { FaCheckCircle, FaExclamationCircle, FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from 'react-icons/fa';

interface UserData {
  email: string;
  displayName: string;
  photoURL: string;
  provider: string;
  name?: string;
  phone?: string;
  address?: string;
  createdAt?: FieldValue;
  lastLogin: FieldValue;
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

function getFriendlyFirebaseAuthErrorMessage(code: string) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Email không hợp lệ.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị vô hiệu hóa.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này.';
    case 'auth/wrong-password':
      return 'Mật khẩu không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký trước đó.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu. Vui lòng đặt mật khẩu ít nhất 6 ký tự.';
    case 'auth/operation-not-allowed':
      return 'Chức năng này chưa được bật trên Firebase.';
    case 'auth/too-many-requests':
      return 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.';
    case 'auth/invalid-credential':
      return 'Thông tin xác thực không hợp lệ. Vui lòng thử lại.';
    case 'auth/account-exists-with-different-credential':
      return 'Tài khoản đã tồn tại với phương thức đăng nhập khác.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.';
    case 'auth/invalid-verification-code':
      return 'Mã xác thực không hợp lệ.';
    case 'auth/invalid-verification-id':
      return 'ID xác thực không hợp lệ.';
    case 'auth/popup-closed-by-user':
      return 'Cửa sổ đăng nhập đã bị đóng.';
    case 'auth/popup-blocked':
      return 'Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép popup.';
    case 'auth/cancelled-popup-request':
      return 'Yêu cầu đăng nhập đã bị hủy.';
    default:
      return 'Có lỗi xảy ra, vui lòng thử lại.';
  }
}

export default function AccountPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  const router = useRouter();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // Create or update user document in Firestore
  const createOrUpdateUserDoc = async (user: User, provider?: string) => {
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    const baseUserData = {
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      provider: provider || 'email',
      lastLogin: serverTimestamp(),
    };

    if (!userDoc.exists()) {
      // New user - create document with social provider info
      const newUserData: UserData = {
        ...baseUserData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };

      // For social logins, auto-fill name from displayName
      if (provider === 'google' || provider === 'facebook') {
        newUserData.name = user.displayName || '';
        // Try to extract phone from provider data if available
        if (user.phoneNumber) {
          newUserData.phone = user.phoneNumber;
        }
      }

      await setDoc(userRef, newUserData);
    } else {
      // Existing user - update last login and merge any new info
      const existingData = userDoc.data();
      const mergeData: Partial<UserData> = {
        ...baseUserData,
      };

      // If user doesn't have name but social provider has displayName, update it
      if (!existingData?.name && user.displayName && (provider === 'google' || provider === 'facebook')) {
        mergeData.name = user.displayName;
      }

      // If user doesn't have phone but provider has phoneNumber, update it
      if (!existingData?.phone && user.phoneNumber) {
        mergeData.phone = user.phoneNumber;
      }

      await setDoc(userRef, mergeData, { merge: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setSocialLoading('google');

    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('profile');
      provider.addScope('email');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await createOrUpdateUserDoc(user, 'google');

      setSuccessMessage('Đăng nhập Google thành công!');
      setTimeout(() => router.push('/'), 1500);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const firebaseError = err as { code: string };
        const friendlyMessage = getFriendlyFirebaseAuthErrorMessage(firebaseError.code);
        setError(friendlyMessage);
      } else {
        setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setSocialLoading('facebook');

    try {
      const provider = new FacebookAuthProvider();
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('public_profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await createOrUpdateUserDoc(user, 'facebook');

      setSuccessMessage('Đăng nhập Facebook thành công!');
      setTimeout(() => router.push('/'), 1500);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const firebaseError = err as { code: string };
        const friendlyMessage = getFriendlyFirebaseAuthErrorMessage(firebaseError.code);
        setError(friendlyMessage);
      } else {
        setError('Đăng nhập Facebook thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await createOrUpdateUserDoc(userCredential.user, 'email');
        setSuccessMessage('Đăng nhập thành công!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await createOrUpdateUserDoc(userCredential.user, 'email');
        setSuccessMessage('Đăng ký thành công!');
      }
      setTimeout(() => router.push('/'), 1500);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const firebaseError = err as { code: string };
        const friendlyMessage = getFriendlyFirebaseAuthErrorMessage(firebaseError.code);
        setError(friendlyMessage);
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 px-4 py-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-700 hover:scale-105">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
            </div>
            <h1 className="text-white text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {mode === 'login' ? 'Chào mừng bạn đến với BiTi Shop' : 'Tạo tài khoản mới'}
            </h1>
            <p className="text-gray-300 text-sm">
              {mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Bắt đầu hành trình của bạn'}
            </p>
          </div>

          {/* Notifications */}
          {error && <Notification type="error" message={error} />}
          {successMessage && <Notification type="success" message={successMessage} />}

          {/* Social Login Buttons */}
          <div className="mb-8 space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || socialLoading !== null}
              className="w-full bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 text-white font-medium transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FaGoogle size={20} className="text-white" />
              )}
              <span>{socialLoading === 'google' ? 'Đang đăng nhập...' : 'Tiếp tục với Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={loading || socialLoading !== null}
              className="w-full bg-blue-600/20 backdrop-blur-lg border border-blue-400/30 rounded-2xl px-6 py-4 text-white font-medium transition-all duration-300 hover:bg-blue-600/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === 'facebook' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FaFacebookF size={20} className="text-white" />
              )}
              <span>{socialLoading === 'facebook' ? 'Đang đăng nhập...' : 'Tiếp tục với Facebook'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-300 font-medium">hoặc</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            {/* Email input */}
            <div className="mb-6">
              <label className="text-white block mb-3 font-medium text-sm tracking-wide">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="your.email@example.com"
                  autoComplete="username"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 opacity-0 transition-opacity duration-300 pointer-events-none focus-within:opacity-10"></div>
              </div>
            </div>

            {/* Password input */}
            <div className="mb-6">
              <label className="text-white block mb-3 font-medium text-sm tracking-wide">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 pr-12 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="Enter your password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password (register mode) */}
            {mode === 'register' && (
              <div className="mb-6">
                <label className="text-white block mb-3 font-medium text-sm tracking-wide">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 pr-12 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || socialLoading !== null}
              className={`w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                loading || socialLoading !== null
                  ? 'opacity-70 cursor-not-allowed animate-pulse' 
                  : 'hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 active:scale-95'
              }`}
            >
              <span className="relative z-10">
                {loading
                  ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {mode === 'login' ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...'}
                    </div>
                  )
                  : (mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản')
                }
              </span>
            </button>
          </form>

          {/* Mode switch */}
          <div className="mt-8 text-center">
            <p className="text-gray-300 text-sm">
              {mode === 'login' ? (
                <>
                  Bạn chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMode('register');
                    }}
                    className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold hover:from-blue-300 hover:to-purple-300 transition-all duration-300 underline decoration-blue-400 hover:decoration-purple-400"
                  >
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMode('login');
                    }}
                    className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold hover:from-blue-300 hover:to-purple-300 transition-all duration-300 underline decoration-blue-400 hover:decoration-purple-400"
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}