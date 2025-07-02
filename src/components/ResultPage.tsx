
import { Button } from '@/components/ui/button';
import { TeacherReport } from '@/types/report';
import { downloadPDF, downloadImage } from '@/utils/download';
import { toast } from '@/hooks/use-toast';

interface ResultPageProps {
  result: TeacherReport;
  onPageChange: (page: 'start' | 'question' | 'loading' | 'result' | 'gallery') => void;
  onRestart: () => void;
}

const ResultPage = ({ result, onPageChange, onRestart }: ResultPageProps) => {
  const handleDownloadPDF = async () => {
    try {
      await downloadPDF('result-content');
      toast({
        title: "PDF 다운로드 완료!",
        description: "쌤BTI 리포트가 저장되었습니다."
      });
    } catch (error) {
      toast({
        title: "PDF 생성 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadImage = async () => {
    try {
      await downloadImage('result-content', '쌤BTI_나의브랜딩리포트.png');
      toast({
        title: "이미지 다운로드 완료!",
        description: "쌤BTI 리포트가 저장되었습니다."
      });
    } catch (error) {
      toast({
        title: "이미지 생성 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div id="result-content" className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg animate-in fade-in duration-500">
        <img
          src={result.imageUrl}
          alt={result.character.name}
          className="w-full rounded-lg shadow-md aspect-square object-cover mb-6"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/e2e8f0/94a3b8?text=Image+Error';
          }}
        />
        
        <div className="text-center mb-6">
          <p className="text-teal-600 font-bold">나의 교육 페르소나</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-1">{result.character.name}</h2>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg mb-6">
          <p className="text-gray-600 leading-relaxed">{result.character.description}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="font-bold text-teal-600 mb-2">나의 슬로건</h3>
          <p className="text-lg font-semibold text-center bg-gray-100 p-4 rounded-lg">"{result.slogan}"</p>
        </div>
        
        <div className="mb-6">
          <h3 className="font-bold text-teal-600 mb-2">나의 강점</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {result.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold text-teal-600 mb-2">성장 포인트</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold text-gray-800">{result.growth_point.title}</p>
            <p className="text-gray-600 mt-1 leading-relaxed">{result.growth_point.description}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={handleDownloadPDF}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 transform hover:scale-105"
          >
            PDF로 저장
          </Button>
          <Button 
            onClick={handleDownloadImage}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 transform hover:scale-105"
          >
            이미지로 저장
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={() => onPageChange('gallery')}
            variant="outline"
            className="w-full border border-teal-600 text-teal-600 hover:bg-teal-50 font-bold py-3 px-4 rounded-xl transition duration-300 transform hover:scale-105"
          >
            갤러리 보기
          </Button>
          <Button 
            onClick={onRestart}
            variant="outline"
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition duration-300 transform hover:scale-105"
          >
            처음으로
          </Button>
        </div>
      </div>
    </>
  );
};

export default ResultPage;
