import { useState, useEffect } from 'react';
import axios from 'axios';
import { Utensils, Loader2, Store } from 'lucide-react';
import { LunchOption } from '../types';
import { LunchOptionCard } from './LunchOptionCard';

interface LunchPageProps {
  onError: () => void;
}

export function LunchPage({ onError }: LunchPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<LunchOption[]>([]);
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });

  const fetchLunch = async (dateStr: string) => {
    setLoading(true);
    setError(null);
    setOptions([]);
    
    const formattedForApi = dateStr.replace(/-/g, '');
    
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
      onError();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLunch(selectedDate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`app-wrapper ${options.length > 0 ? 'has-content' : ''}`}>
      <div className="main-card fade-in">
        <Utensils className="logo-icon" size={64} />
        <div className="header-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0 }}>{selectedDate.replace(/-/g, '/')} 的午餐</h1>
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
        </div>

        {options.length === 0 && !error && (
          <div className="step-container fade-in">
            <p className="subtitle">正在為您準備美味的午餐清單...</p>
            {loading && <Loader2 className="spinner large-spinner" size={40} />}
          </div>
        )}
        
        {error && (
          <div className="step-container fade-in">
            <div className="error-message" style={{ marginTop: '20px' }}>{error}</div>
          </div>
        )}
      </div>

      {options.length > 0 && (
        <div className="content-display fade-in">
          <div className="restaurants-header">
            <Store size={28} className="store-icon" />
            <h2>今日可選餐廳 ({options.length})</h2>
          </div>

          <div className="options-grid">
            {options.map((opt, i) => (
              <LunchOptionCard 
                key={i} 
                opt={opt} 
                selectedDate={selectedDate}
                onRefresh={() => fetchLunch(selectedDate)} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
