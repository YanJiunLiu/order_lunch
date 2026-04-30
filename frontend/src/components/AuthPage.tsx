import { useState, useEffect } from 'react';
import axios from 'axios';
import { Utensils, Loader2, LogIn, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phpsessidInput, setPhpsessidInput] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');
  const [isShake, setIsShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  const todayStr = d.toISOString().split('T')[0];

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/login');
      const data = response.data;
      if (data.redirect_url) {
        window.open(data.redirect_url, '_blank');
      } else {
        setError('無法取得登入網址。');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || '取得登入網址失敗，請確認後端伺服器是否正常運行。');
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = (msg: string) => {
    setUpdateMsg(msg);
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
  };

  useEffect(() => {
    const cachedSession = localStorage.getItem('PHPSESSID');
    if (cachedSession) {
      setPhpsessidInput(cachedSession);
      handleVerifyCookie(cachedSession);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerifyCookie = async (sessionToVerify?: string) => {
    const session = typeof sessionToVerify === 'string' ? sessionToVerify : phpsessidInput.trim();
    if (!session) {
      triggerShake('請輸入 PHPSESSID');
      return;
    }
    setLoading(true);
    setUpdateMsg('驗證中...');
    setIsShake(false);
    try {
      await axios.post('/api/v1/cookie', { phpsessid: session });
      setUpdateMsg('✅ 驗證成功！');
      localStorage.setItem('PHPSESSID', session);
      onLoginSuccess();
    } catch (err: any) {
      localStorage.removeItem('PHPSESSID');
      setPhpsessidInput('');
      triggerShake(err.response?.data?.detail || '❌ 更新失敗，請確認後端連線。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="main-card fade-in">
        <Utensils className="logo-icon" size={64} />
        <div className="header-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0 }}>{todayStr.replace(/-/g, '/')} 的午餐</h1>
        </div>

        <div className="step-container fade-in">
          <p className="subtitle">取得福利網存取權限</p>
          
          <button
            className="action-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" size={20} /> : <LogIn size={20} />}
            1. 點此開新分頁登入微軟帳號
          </button>

          <div className="divider"><span>或是您已經有 Cookie</span></div>

          <p className="subtitle" style={{marginTop: '0.5rem', marginBottom: '0.5rem'}}>2. 貼上 PHPSESSID (按 F12 從 Application 複製)</p>
          <div className="cookie-input-section">
            <div className="cookie-input-group">
              <KeyRound size={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={isShake ? 'error-shake' : ''}
                placeholder="輸入 PHPSESSID..."
                value={phpsessidInput}
                onChange={(e) => setPhpsessidInput(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyCookie();
                  }
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "隱藏密碼" : "顯示密碼"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              className="action-btn"
              onClick={handleVerifyCookie}
              disabled={loading}
            >
              {loading ? <Loader2 className="spinner" size={20} /> : '驗證並進入系統'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
          {updateMsg && <div className={`update-msg ${isShake ? 'error-text' : ''}`}>{updateMsg}</div>}
        </div>
      </div>
    </div>
  );
}
