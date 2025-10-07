import { Button } from '@/components/ui/button';

interface StartPageProps {
  onPageChange: (page: 'start' | 'question' | 'loading' | 'result' | 'gallery') => void;
}

const StartPage = ({ onPageChange }: StartPageProps) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center animate-in fade-in duration-500">
      <h1 className="text-4xl font-bold text-teal-700 mb-4">쌤BTI</h1>
      <p className="text-lg text-gray-600 mb-2">나는 어떤 선생님일까?</p>
      <p className="text-gray-500 mb-8">AI가 나의 교육 브랜드를 분석하고 마스코트까지 그려드려요!</p>
      
      <div className="space-y-4">
        <Button 
          onClick={() => onPageChange('question')}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl text-lg transition duration-300 shadow-md transform hover:scale-105"
        >
          내 브랜딩 진단하기
        </Button>
        
        <Button 
          onClick={() => onPageChange('gallery')}
          variant="outline"
          className="w-full border border-teal-600 text-teal-600 hover:bg-teal-50 font-bold py-3 px-4 rounded-xl text-lg transition duration-300 transform hover:scale-105"
        >
          다른 쌤들 결과보기
        </Button>
      </div>
    </div>
  );
};

export default StartPage;
