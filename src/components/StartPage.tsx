import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface StartPageProps {
  onPageChange: (page: 'start' | 'question' | 'loading' | 'result' | 'gallery') => void;
}

const StartPage = ({ onPageChange }: StartPageProps) => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      console.log('오래된 리포트 정리 시작...');
      const { data, error } = await supabase.functions.invoke('cleanup-old-reports');
      
      if (error) {
        console.error('정리 실패:', error);
        toast({
          title: "정리 실패",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('정리 완료:', data);
        toast({
          title: "정리 완료!",
          description: data.deletedCount 
            ? `${data.deletedCount}개의 오래된 리포트가 삭제되었습니다.`
            : "정리할 리포트가 없습니다.",
        });
      }
    } catch (error) {
      console.error('정리 오류:', error);
      toast({
        title: "오류 발생",
        description: "정리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsCleaningUp(false);
    }
  };
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

        <Button 
          onClick={handleCleanup}
          disabled={isCleaningUp}
          variant="outline"
          className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold py-2 px-4 rounded-xl text-sm transition duration-300 disabled:opacity-50"
        >
          {isCleaningUp ? '정리 중...' : '🧹 오래된 데이터 정리 (500개 초과 시)'}
        </Button>
      </div>
    </div>
  );
};

export default StartPage;
