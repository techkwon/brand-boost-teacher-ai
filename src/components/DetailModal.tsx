
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TeacherReport } from '@/types/report';

interface DetailModalProps {
  isOpen: boolean;
  report: TeacherReport | null;
  onClose: () => void;
}

const DetailModal = ({ isOpen, report, onClose }: DetailModalProps) => {
  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">브랜딩 상세 정보</DialogTitle>
        </DialogHeader>
        
        <div className="p-2">
          <div className="mb-6">
            <img 
              src={report.imageUrl} 
              alt={report.character.name}
              className="w-full rounded-lg shadow-md aspect-square object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/e2e8f0/94a3b8?text=Image+Error';
              }}
            />
          </div>
          
          <div className="text-center mb-6">
            <p className="text-teal-600 font-bold">나의 교육 페르소나</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-1">{report.character.name}</h2>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg mb-6">
            <p className="text-gray-600 leading-relaxed">{report.character.description}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold text-teal-600 mb-2">나의 슬로건</h3>
            <p className="text-lg font-semibold text-center bg-gray-100 p-4 rounded-lg">"{report.slogan}"</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold text-teal-600 mb-2">나의 강점</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {report.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold text-teal-600 mb-2">성장 포인트</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="font-semibold text-gray-800">{report.growth_point.title}</p>
              <p className="text-gray-600 mt-1 leading-relaxed">{report.growth_point.description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailModal;
