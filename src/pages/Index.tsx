
import { useState } from 'react';
import StartPage from '@/components/StartPage';
import QuestionPage from '@/components/QuestionPage';
import LoadingPage from '@/components/LoadingPage';
import ResultPage from '@/components/ResultPage';
import GalleryPage from '@/components/GalleryPage';
import DetailModal from '@/components/DetailModal';
import { TeacherReport } from '@/types/report';

type PageType = 'start' | 'question' | 'loading' | 'result' | 'gallery';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('start');
  const [currentResult, setCurrentResult] = useState<TeacherReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<TeacherReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleResultGenerated = (result: TeacherReport) => {
    setCurrentResult(result);
    setCurrentPage('result');
  };

  const handleReportSelect = (report: TeacherReport) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleRestart = () => {
    setCurrentResult(null);
    setCurrentPage('start');
  };

  return (
    <div className="min-h-screen bg-amber-50 text-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {currentPage === 'start' && (
          <StartPage onPageChange={handlePageChange} />
        )}
        
        {currentPage === 'question' && (
          <QuestionPage 
            onPageChange={handlePageChange}
            onResultGenerated={handleResultGenerated}
          />
        )}
        
        {currentPage === 'loading' && (
          <LoadingPage />
        )}
        
        {currentPage === 'result' && currentResult && (
          <ResultPage 
            result={currentResult}
            onPageChange={handlePageChange}
            onRestart={handleRestart}
          />
        )}
        
        {currentPage === 'gallery' && (
          <GalleryPage 
            onPageChange={handlePageChange}
            onReportSelect={handleReportSelect}
          />
        )}
      </div>

      <DetailModal
        isOpen={isModalOpen}
        report={selectedReport}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default Index;
