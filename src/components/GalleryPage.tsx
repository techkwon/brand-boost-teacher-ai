
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TeacherReport } from '@/types/report';

interface GalleryPageProps {
  onPageChange: (page: 'start' | 'question' | 'loading' | 'result' | 'gallery') => void;
  onReportSelect: (report: TeacherReport) => void;
}

const GalleryPage = ({ onPageChange, onReportSelect }: GalleryPageProps) => {
  const [reports, setReports] = useState<TeacherReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    try {
      // 여기에 Supabase에서 데이터를 가져오는 로직이 들어갈 예정입니다
      // 현재는 로컬 스토리지에서 샘플 데이터를 생성합니다
      const sampleReports: TeacherReport[] = [
        {
          id: '1',
          character: {
            name: '지식의 맛을 창조하는 유쾌한 셰프',
            description: '다양한 지식을 요리사처럼 융합하고, 재미있는 이야기라는 특별한 레시피로 학생들이 지식의 맛을 쉽게 느끼도록 돕습니다.'
          },
          slogan: '세상 모든 지식에 재미 한 스푼, 성장 두 스푼!',
          strengths: ['복잡한 개념을 흥미로운 스토리로 풀어내는 탁월한 비유 능력', '학생들이 재미를 느끼며 자발적으로 성장하도록 이끄는 긍정적 학습 환경 조성'],
          growth_point: {
            title: '메인 디시의 깊이를 더하는 오늘의 핵심 레시피',
            description: '유쾌한 코스 요리 마지막에 오늘의 핵심 지식이라는 메인 디시를 명확히 짚어주는 활동을 추가해보세요.'
          },
          imageUrl: 'https://placehold.co/300x300/14b8a6/ffffff?text=Chef',
          createdAt: new Date().toISOString()
        }
      ];
      
      setReports(sampleReports);
    } catch (error) {
      console.error('갤러리 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-teal-700">브랜딩 갤러리</h2>
        <Button 
          onClick={() => onPageChange('start')}
          variant="outline"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition"
        >
          처음으로
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center">
            <div className="loader inline-block border-4 border-gray-200 border-t-4 border-t-teal-600 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            아직 등록된 결과가 없습니다. 첫 번째 결과를 만들어보세요!
          </p>
        ) : (
          reports.map((report, index) => (
            <div 
              key={index}
              className="cursor-pointer group"
              onClick={() => onReportSelect(report)}
            >
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-200">
                <img 
                  src={report.imageUrl} 
                  alt={report.character.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/e2e8f0/94a3b8?text=Image';
                  }}
                />
              </div>
              <h3 className="mt-2 font-bold text-gray-800 truncate">{report.character.name}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
