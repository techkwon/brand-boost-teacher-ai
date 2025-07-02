
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TeacherReport } from '@/types/report';
import { loadReportsFromSupabase } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';

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
      const supabaseReports = await loadReportsFromSupabase();
      setReports(supabaseReports);
    } catch (error) {
      console.error('갤러리 로딩 오류:', error);
      toast({
        title: "데이터 로딩 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
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
              key={report.id || index}
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
