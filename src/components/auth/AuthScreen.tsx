import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { hashPassword, findUser, saveUser, saveSession } from '../../utils/storage';
import type { Session, User } from '../../types/auth';

interface AuthScreenProps {
  onAuth: (session: Session) => void;
}

type AuthMode = 'choose' | 'login' | 'register';

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('choose');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleGuestPlay = () => {
    const session: Session = { username: 'Guest', isGuest: true };
    saveSession(session);
    onAuth(session);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = findUser(username.trim());
      if (!user) {
        setError('找不到此帳號。');
        return;
      }
      const hash = await hashPassword(password);
      if (hash !== user.passwordHash) {
        setError('密碼錯誤。');
        return;
      }
      const session: Session = { username: user.username, isGuest: false };
      saveSession(session);
      onAuth(session);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError('帳號至少需要 3 個字元。');
      return;
    }
    if (password.length < 6) {
      setError('密碼至少需要 6 個字元。');
      return;
    }
    if (password !== confirmPassword) {
      setError('兩次密碼不一致。');
      return;
    }
    if (findUser(trimmed)) {
      setError('此帳號已被使用。');
      return;
    }
    setLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      const user: User = { username: trimmed, passwordHash, createdAt: Date.now() };
      saveUser(user);
      const session: Session = { username: trimmed, isGuest: false };
      saveSession(session);
      onAuth(session);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-3 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
          <p className="text-amber-700">登入以儲存分數，或以訪客身份遊玩！</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-amber-200 p-8 w-full max-w-sm flex flex-col gap-4">
          <Button
            onClick={() => switchMode('login')}
            className="bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg"
          >
            登入
          </Button>
          <Button
            onClick={() => switchMode('register')}
            variant="outline"
            className="border-amber-400 text-amber-800 hover:bg-amber-50 py-6 text-lg"
          >
            註冊新帳號
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-amber-200" />
            <span className="text-amber-400 text-sm">或</span>
            <div className="flex-1 h-px bg-amber-200" />
          </div>

          <Button
            onClick={handleGuestPlay}
            variant="ghost"
            className="text-amber-600 hover:bg-amber-50"
          >
            以訪客身份遊玩（不儲存分數）
          </Button>
        </div>
      </div>
    );
  }

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-amber-200 p-8 w-full max-w-sm">
        <button
          onClick={() => switchMode('choose')}
          className="text-amber-600 text-sm mb-6 hover:underline"
        >
          ← 返回
        </button>

        <h2 className="text-2xl text-amber-900 mb-6">{isLogin ? '登入' : '註冊新帳號'}</h2>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="username" className="text-amber-800">帳號</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="請輸入帳號"
              required
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="password" className="text-amber-800">密碼</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="confirm" className="text-amber-800">確認密碼</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="再次輸入密碼"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white mt-2"
          >
            {loading ? '處理中...' : isLogin ? '登入' : '註冊'}
          </Button>
        </form>

        <p className="text-center text-amber-700 text-sm mt-5">
          {isLogin ? (
            <>
              還沒有帳號？{' '}
              <button
                onClick={() => switchMode('register')}
                className="text-amber-600 font-medium hover:underline"
              >
                立即註冊
              </button>
            </>
          ) : (
            <>
              已有帳號？{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-amber-600 font-medium hover:underline"
              >
                前往登入
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
