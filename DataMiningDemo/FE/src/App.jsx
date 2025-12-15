import { useState, useEffect } from 'react';
import Header from './components/Header';
import PersonalInfo from './components/PersonalInfo';
import UsageActivity from './components/UsageActivity';
import DeviceOffline from './components/DeviceOffline';
import PredictButton from './components/PredictButton';
import Result from './components/Result';
import ModelSelector from './components/ModelSelector';

function App() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('darkMode') === 'true';
    } catch {
      return false;
    }
  });
  const [formData, setFormData] = useState({
    gender: 'Female',  
    age: 25,  
    country: 'CA',  
    subscription_type: 'Free',  
    listening_time: 100,  
    songs_played_per_day: 23,  
    skip_rate: 0.2,  
    device_type: 'Desktop',  
  });
  const [modelType, setModelType] = useState('lg');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(prev => !prev);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', newDark);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleModelChange = (e) => {  
    setModelType(e.target.value);
    if (result) setResult(null);  
  };

  const validateForm = () => {
    const requiredFields = [
      'gender', 'age', 'country', 'subscription_type', 'listening_time', 
      'songs_played_per_day', 'skip_rate', 'device_type'
    ];
    let errorMsg = '';

    // Check required (undefined, null, empty string, hoặc NaN cho numbers)
    for (const field of requiredFields) {
      const value = formData[field];
      if (value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value))) {
        errorMsg = `Vui lòng điền đầy đủ trường ${field}.`;
        break;
      }
    }

    if (!errorMsg) {
      // Check ranges (từ dataset/backend constraints)
      if (formData.age < 16 || formData.age > 59) errorMsg = 'Tuổi phải từ 16-59.';
      if (formData.listening_time < 10 || formData.listening_time > 299) errorMsg = 'Thời gian nghe phải từ 10-299 phút.';
      if (formData.songs_played_per_day < 1 || formData.songs_played_per_day > 99) errorMsg = 'Số bài hát/ngày phải từ 1-99.';
      if (formData.skip_rate < 0 || formData.skip_rate > 0.6) errorMsg = 'Tỷ lệ skip phải từ 0-0.6.';
    }

    if (errorMsg) {
      setError(errorMsg);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/predict_churn?model_type=${modelType}`, {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const prob = (data.churn_probability * 100).toFixed(1);
      const risk = data.churn_probability < 0.3 ? 'Thấp' : data.churn_probability < 0.7 ? 'Trung bình' : 'Cao';
      setResult({ prob, risk, label: data.churn_label });  
    } catch (err) {
      setError(`Lỗi gọi API: ${err.message}. Đảm bảo backend chạy trên port 8000 và train_model.py đã chạy.`);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      gender: 'Male',
      age: 38,
      country: 'US',
      subscription_type: 'Premium',
      listening_time: 154,
      songs_played_per_day: 50,
      skip_rate: 0.3,
      device_type: 'Mobile',
    });
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header isDark={isDark} onToggleDark={toggleDark} />
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300">
          <p className="text-center text-gray-800 dark:text-gray-300 mb-8 text-lg font-semibold">
            Nhập thông tin người dùng Spotify để dự đoán khả năng rời bỏ
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ModelSelector modelType={modelType} onChange={handleModelChange} />  
            <PersonalInfo formData={formData} onChange={handleChange} />
            <UsageActivity formData={formData} onChange={handleChange} />
            <DeviceOffline formData={formData} onChange={handleChange} />
            {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}
            <PredictButton onReset={resetForm} result={result} loading={loading} /> 
          </form>
          <Result result={result} modelType={modelType} />  
        </div>
      </main>
    </div>
  );
}

export default App;