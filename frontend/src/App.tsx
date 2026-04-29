import { useState, useEffect } from 'react';
import axios from 'axios';
import { Utensils, Loader2, Store, ExternalLink, LogIn, KeyRound } from 'lucide-react';
import './index.css';

interface LunchOption {
  restaurant: string;
  purchase_link: string;
}

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 2 State
  const [phpsessidInput, setPhpsessidInput] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');
  const [isShake, setIsShake] = useState(false);

  // Step 3 State
  const [options, setOptions] = useState<LunchOption[]>([]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/login');
      const data = response.data;
      if (data.redirect_url) {
        window.open(data.redirect_url, '_blank');
        setStep(2);
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

  const handleVerifyCookie = async () => {
    if (!phpsessidInput.trim()) {
      triggerShake('請輸入 PHPSESSID');
      return;
    }
    setLoading(true);
    setUpdateMsg('驗證中...');
    setIsShake(false);
    try {
      await axios.post('http://localhost:8000/api/v1/cookie', { phpsessid: phpsessidInput.trim() });
      setUpdateMsg('✅ 驗證成功！');
      setStep(3);
    } catch (err: any) {
      triggerShake(err.response?.data?.detail || '❌ 更新失敗，請確認後端連線。');
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = (msg: string) => {
    setUpdateMsg(msg);
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500); // 搖晃動畫時間
  };

  const fetchLunch = async () => {
    setLoading(true);
    setError(null);
    setOptions([]);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/lunch');
      const data = response.data;
      if (data.options && data.options.length > 0) {
        setOptions(data.options);
      } else {
        setError('目前沒有找到可選擇的餐廳。');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      // 如果在這裡發現 401，代表 session 失效，退回 step 2
      if (err.response?.status === 401) {
        setStep(2);
        triggerShake('Session 已失效，請重新取得 Cookie');
      } else {
        setError(err.response?.data?.detail || '連線至伺服器時發生錯誤。');
      }
    } finally {
      setLoading(false);
    }
  };

  // 當進入 step 3 時自動抓取午餐
  useEffect(() => {
    if (step === 3) {
      fetchLunch();
    }
  }, [step]);

  return (
    <div className={`app-wrapper ${step === 3 && options.length > 0 ? 'has-content' : ''}`}>
      <div className="main-card fade-in">
        <Utensils className="logo-icon" size={64} />
        <div className="header-text">
          <h1>今日午餐</h1>
        </div>

        {step === 1 && (
          <div className="step-container fade-in">
            <p className="subtitle">請先登入微軟帳號，取得福利網存取權限</p>
            <button 
              className="action-btn"
              onClick={handleLogin} 
              disabled={loading}
            >
              {loading ? <Loader2 className="spinner" size={20} /> : <LogIn size={20} />}
              前往登入
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {step === 2 && (
          <div className="step-container fade-in">
            <p className="subtitle">請按 F12 從 Application 複製 PHPSESSID 貼到下方</p>
            <div className="cookie-input-section">
              <div className="cookie-input-group">
                <KeyRound size={20} className="input-icon" />
                <input 
                  type="text" 
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
              </div>
              <button 
                className="action-btn" 
                onClick={handleVerifyCookie}
                disabled={loading}
              >
                {loading ? <Loader2 className="spinner" size={20} /> : '驗證並進入系統'}
              </button>
            </div>
            {updateMsg && <div className={`update-msg ${isShake ? 'error-text' : ''}`}>{updateMsg}</div>}
          </div>
        )}

        {step === 3 && options.length === 0 && !error && (
          <div className="step-container fade-in">
             <p className="subtitle">正在為您準備美味的午餐清單...</p>
             {loading && <Loader2 className="spinner large-spinner" size={40} />}
          </div>
        )}
        
        {step === 3 && error && (
          <div className="step-container fade-in">
            <div className="error-message">{error}</div>
            <button className="action-btn" onClick={fetchLunch}>重試</button>
          </div>
        )}
      </div>

      {step === 3 && options.length > 0 && (
        <div className="content-display fade-in">
          <div className="restaurants-header">
            <Store size={28} className="store-icon" />
            <h2>今日可選餐廳 ({options.length})</h2>
          </div>
          
          <div className="options-grid">
            {options.map((opt, i) => (
              <div key={i} className="option-card">
                <h3>{opt.restaurant}</h3>
                {opt.purchase_link ? (
                  <a 
                    href={opt.purchase_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="purchase-btn"
                  >
                    開始訂 <ExternalLink size={16} />
                  </a>
                ) : (
                  <button 
                    className="purchase-btn disabled" 
                    disabled
                  >
                    開始訂 (尚未開放)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
