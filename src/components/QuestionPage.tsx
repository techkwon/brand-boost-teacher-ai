
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { questions } from '@/data/questions';
import { UserAnswers, AIAnalysisResult, TeacherReport } from '@/types/report';
import { callGeminiTextAPI, callGeminiImageAPI, compressImage } from '@/utils/api';
import { toast } from '@/hooks/use-toast';

interface QuestionPageProps {
  onPageChange: (page: 'start' | 'question' | 'loading' | 'result' | 'gallery') => void;
  onResultGenerated: (result: TeacherReport) => void;
}

const QuestionPage = ({ onPageChange, onResultGenerated }: QuestionPageProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [subjectiveInput, setSubjectiveInput] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleAnswer = (questionId: string, answerValue: string) => {
    const newAnswers = { ...userAnswers, [questionId]: answerValue };
    setUserAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSubjectiveInput('');
    } else {
      startAnalysis(newAnswers);
    }
  };

  const handleSubjectiveSubmit = () => {
    const value = subjectiveInput.trim();
    if (!value) {
      toast({
        title: "답변을 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    handleAnswer(currentQuestion.id, value);
  };

  const startAnalysis = async (answers: UserAnswers) => {
    onPageChange('loading');
    
    try {
      console.log('텍스트 분석 시작...');
      const textResult: AIAnalysisResult = await callGeminiTextAPI(answers);
      console.log('텍스트 분석 완료:', textResult);
      
      console.log('이미지 생성 시작...');
      const imageUrl = await callGeminiImageAPI(textResult.image_prompt);
      console.log('이미지 생성 완료');
      
      console.log('이미지 압축 시작...');
      const compressedImageUrl = await compressImage(imageUrl, 0.7);
      console.log('이미지 압축 완료');

      const finalResult: TeacherReport = {
        character: textResult.character,
        slogan: textResult.slogan,
        strengths: textResult.strengths,
        growth_point: textResult.growth_point,
        imageUrl: compressedImageUrl,
        createdAt: new Date().toISOString()
      };

      onResultGenerated(finalResult);
      
    } catch (error) {
      console.error("분석 오류:", error);
      toast({
        title: "분석 중 오류가 발생했습니다",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
      onPageChange('start');
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg animate-in fade-in duration-500">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center h-24 flex items-center justify-center">
          {currentQuestion.text}
        </h2>
        
        <div className="space-y-4">
          {currentQuestion.type === 'objective' ? (
            currentQuestion.options?.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                variant="outline"
                className="w-full border border-gray-300 p-3 rounded-lg text-left hover:bg-amber-100 transition duration-200 transform hover:scale-105 h-auto whitespace-normal"
              >
                {option.text}
              </Button>
            ))
          ) : (
            <>
              <Textarea
                value={subjectiveInput}
                onChange={(e) => setSubjectiveInput(e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={4}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
              <Button
                onClick={handleSubjectiveSubmit}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl mt-4 transform hover:scale-105 transition"
              >
                다음
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
