
import { useState, useEffect } from 'react';

const LoadingPage = () => {
  const [loadingText, setLoadingText] = useState('AI가 성향을 분석중입니다...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setLoadingText('AI가 마스코트를 그리고 있어요...');
    }, 3000);

    const timer2 = setTimeout(() => {
      setLoadingText('거의 완성되었어요!');
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center animate-in fade-in duration-500">
      <div className="loader mb-6 border-6 border-gray-200 border-t-6 border-t-teal-600 rounded-full w-16 h-16 animate-spin"></div>
      <h2 className="text-2xl font-bold text-teal-700 mb-2">AI가 분석 중입니다</h2>
      <p className="text-gray-600">{loadingText}</p>
    </div>
  );
};

export default LoadingPage;
