'use client';

import { useState, useEffect } from 'react';
import { auth, firestore } from '../../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function Notification({
  type,
  message,
}: {
  type: 'success' | 'error';
  message: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-md text-sm font-semibold mb-6 ${
        type === 'success'
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-red-100 text-red-700 border border-red-300'
      }`}
      role="alert"
    >
      {type === 'success' ? (
        <FaCheckCircle size={20} />
      ) : (
        <FaExclamationCircle size={20} />
      )}
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
    default:
      return 'Có lỗi xảy ra, vui lòng thử lại.';
  }
}

export default function AccountPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

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
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Đăng nhập thành công!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCredential.user;

        await setDoc(doc(firestore, 'users', user.uid), {
          email: user.email,
          createdAt: serverTimestamp(),
        });

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
}
 finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h1 className="text-black text-3xl font-bold mb-8 text-center">
          {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản mới'}
        </h1>

        {error && <Notification type="error" message={error} />}
        {successMessage && <Notification type="success" message={successMessage} />}

        <label className="text-black block mb-2 font-semibold">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-black w-full border border-gray-300 rounded px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập email"
          autoComplete="username"
        />

        <label className="text-black block mb-2 font-semibold">Mật khẩu</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-black w-full border border-gray-300 rounded px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập mật khẩu"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />

        {mode === 'register' && (
          <>
            <label className="text-black block mb-2 font-semibold">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-black w-full border border-gray-300 rounded px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Xác nhận mật khẩu"
              autoComplete="new-password"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading
            ? mode === 'login'
              ? 'Đang đăng nhập...'
              : 'Đang tạo tài khoản...'
            : mode === 'login'
            ? 'Đăng nhập'
            : 'Tạo tài khoản'}
        </button>

        <p className="mt-6 text-center text-gray-700">
          {mode === 'login' ? (
            <>
              Bạn chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('register');
                }}
                className="text-blue-600 font-semibold hover:underline"
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
                className="text-blue-600 font-semibold hover:underline"
              >
                Đăng nhập
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
