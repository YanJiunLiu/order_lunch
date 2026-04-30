import { useState, useEffect } from 'react';
import axios from 'axios';
import { Ban, ExternalLink, Save, Trash2, History } from 'lucide-react';
import { LunchOption, RecordData } from '../types';

interface LunchOptionCardProps {
  opt: LunchOption;
  selectedDate: string;
  onRefresh: () => void;
}

export function LunchOptionCard({ opt, selectedDate, onRefresh }: LunchOptionCardProps) {
  const [description, setDescription] = useState('');
  const [records, setRecords] = useState<RecordData[]>([]);
  const [expandedRecords, setExpandedRecords] = useState(false);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`/api/v1/record?name=${encodeURIComponent(opt.restaurant)}`);
      setRecords(response.data);
    } catch (err) {
      console.error('Fetch records error:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [opt.restaurant]);

  const handleAddToBlacklist = async (restaurantName: string) => {
    try {
      await axios.post('/api/v1/black_list', { name: restaurantName });
      alert(`已將「${restaurantName}」加入黑名單！`);
      onRefresh();
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
      onRefresh();
    } catch (err) {
      alert('解除隱藏失敗，請稍後再試。');
    }
  };

  const handleCreateRecord = async () => {
    try {
      await axios.post('/api/v1/record', {
        name: opt.restaurant,
        created: selectedDate,
        description: description || ''
      });
      alert('紀錄新增成功！');
      setDescription('');
      fetchRecords();
    } catch (err) {
      alert('紀錄新增失敗，請稍後再試。');
    }
  };

  const handleDeleteRecord = async (id: number) => {
    if (!window.confirm('確定要刪除這筆紀錄嗎？')) return;
    try {
      await axios.delete(`/api/v1/record/${id}`);
      fetchRecords();
    } catch (err) {
      alert('刪除失敗');
    }
  };

  return (
    <div className={`option-card ${opt.banned ? 'banned-card' : ''}`}>
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
      
      {/* 紀錄功能區塊 */}
      <div className="record-input-section" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          className="record-input"
          placeholder="輸入訂餐紀錄..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          className="action-btn"
          style={{ padding: '8px 12px', minWidth: 'auto', margin: 0 }}
          onClick={handleCreateRecord}
          title="新增紀錄"
        >
          <Save size={16} /> 紀錄
        </button>
      </div>

      {opt.purchase_link && !opt.banned ? (
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
          開始訂 {opt.banned ? '(不推薦)' : '(尚未開放)'}
        </button>
      )}

      {/* 歷史紀錄顯示區塊 */}
      <div className="records-section" style={{ marginTop: '12px' }}>
        <button 
          className="toggle-records-btn"
          onClick={() => setExpandedRecords(!expandedRecords)}
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', padding: 0 }}
        >
          <History size={16} />
          {expandedRecords ? '隱藏歷史紀錄' : `顯示歷史紀錄 (${records?.length || 0})`}
        </button>
        
        {expandedRecords && records && records.length > 0 && (
          <div className="records-list" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {records.map(record => (
              <div key={record.id} className="record-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', padding: '6px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#2563eb', fontWeight: '500', marginRight: '8px', fontSize: '0.8rem' }}>{record.created.replace(/-/g, '/')}</span>
                  <span style={{ color: '#374151', fontWeight: '500' }}>{record.description}</span>
                </div>
                <button 
                  onClick={() => handleDeleteRecord(record.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  title="刪除紀錄"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {expandedRecords && (!records || records.length === 0) && (
          <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#999' }}>暫無紀錄</div>
        )}
      </div>
    </div>
  );
}
