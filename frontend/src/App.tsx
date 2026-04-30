import { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { LunchPage } from './components/LunchPage';
import './index.css';

function App() {
  const [step, setStep] = useState(1);

  return (
    <>
      {step === 1 && <AuthPage onLoginSuccess={() => setStep(2)} />}
      {step === 2 && (
        <LunchPage
          onError={() => {
            localStorage.removeItem('PHPSESSID');
            alert('發生錯誤或登入失效，請確認您的 PHPSESSID 是否正確或已過期');
            setStep(1);
          }}
        />
      )}
    </>
  );
}

export default App;
