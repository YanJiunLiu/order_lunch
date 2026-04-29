import { useState, useEffect } from 'react';
import axios from 'axios';
import { Utensils, Loader2, Store, ExternalLink, LogIn, KeyRound, Ban, Eye, EyeOff } from 'lucide-react';
import './index.css';

interface LunchOption {
  restaurant: string;
  purchase_link: string;
  banned: boolean;
}

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date State
  const [selectedDate, setSelectedDate] = useState(() => {
    // 取得台灣時間的 YYYY-MM-DD
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });

  // Step 2 State
  const [phpsessidInput, setPhpsessidInput] = useState('7ubkmimgklgsitbhqpt35931ht');
  const [updateMsg, setUpdateMsg] = useState('');
  const [isShake, setIsShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 3 State
  const [options, setOptions] = useState<LunchOption[]>([]);

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

  const handleVerifyCookie = async () => {
    if (!phpsessidInput.trim()) {
      triggerShake('請輸入 PHPSESSID');
      return;
    }
    setLoading(true);
    setUpdateMsg('驗證中...');
    setIsShake(false);
    try {
      await axios.post('/api/v1/cookie', { phpsessid: phpsessidInput.trim() });
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

  const handleAddToBlacklist = async (restaurantName: string) => {
    try {
      await axios.post('/api/v1/black_list', { name: restaurantName });
      alert(`已將「${restaurantName}」加入黑名單！`);
      fetchLunch(); // 新增成功後自動重新整理清單
    } catch (err: any) {
      if (err.response?.status === 400) {
        alert(`「${restaurantName}」已經在黑名單中了！`);
      } else {
        alert('新增到黑名單失敗，請稍後再試。');
      }
    }
  };

  const handleRemoveFromBlacklist = async (id: number, restaurantName: string) => {
    try {
      await axios.delete(`/api/v1/black_list/${id}`);
      alert(`已將「${restaurantName}」解除隱藏！`);
      fetchLunch(); // 刪除成功後自動重新整理清單
    } catch (err) {
      alert('解除隱藏失敗，請稍後再試。');
    }
  };

  const fetchLunch = async (dateStr?: string) => {
    setLoading(true);
    setError(null);
    setOptions([]);
    
    const targetDate = dateStr || selectedDate;
    const formattedForApi = targetDate.replace(/-/g, ''); // 轉成 YYYYMMDD
    
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(`/api/v1/lunch?date=${formattedForApi}&_t=${timestamp}`);
      const data = response.data;
      if (data.options && data.options.length > 0) {
        setOptions(data.options);
      } else {
        setError('目前沒有找到可選擇的餐廳。');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setStep(1);
      triggerShake('登入失敗，請確認您的 PHPSESSID 是否正確或已過期');
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
        <div className="header-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0 }}>{selectedDate.replace(/-/g, '/')} 的午餐</h1>
          {step === 3 && (
            <input 
              type="date" 
              className="date-picker"
              value={selectedDate}
              onChange={(e) => {
                const newDate = e.target.value;
                if (newDate) {
                  setSelectedDate(newDate);
                  fetchLunch(newDate);
                }
              }}
              disabled={loading}
              title="選擇日期"
            />
          )}
        </div>

        {step === 1 && (
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
        )}

        {step === 3 && options.length === 0 && !error && (
          <div className="step-container fade-in">
            <p className="subtitle">正在為您準備美味的午餐清單...</p>
            {loading && <Loader2 className="spinner large-spinner" size={40} />}
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
              <div key={i} className={`option-card ${opt.banned ? 'banned-card' : ''}`}>
                <div className="option-header">
                  <h3>{opt.restaurant}</h3>
                  {!opt.banned ? (
                    <button
                      className="blacklist-btn"
                      title="新增至黑名單"
                      onClick={() => handleAddToBlacklist(opt.restaurant)}
                    >
                      <Ban size={16} />
                    </button>
                  ) : (
                    <div className="banned-actions">
                      <span className="banned-badge">很難吃</span>
                      <button 
                        className="unban-btn" 
                        title="給他一次機會"
                        onClick={() => {
                          if (opt.blacklist_id != null) {
                            handleRemoveFromBlacklist(opt.blacklist_id, opt.restaurant);
                          } else {
                            alert("系統錯誤：找不到該黑名單的 ID");
                          }
                        }}
                      >
                        給他一次機會
                      </button>
                    </div>
                  )}
                </div>
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
