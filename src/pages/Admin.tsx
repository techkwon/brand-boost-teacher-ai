import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { loadReportsFromSupabase } from '@/services/supabaseService';

const Admin = () => {
  const [keepCount, setKeepCount] = useState('500');
  const [isLoading, setIsLoading] = useState(false);
  const [totalReports, setTotalReports] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // 토큰 확인
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    // 토큰 유효성 검증
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.exp < Date.now()) {
        localStorage.removeItem('adminToken');
        toast({
          title: '세션 만료',
          description: '다시 로그인해주세요.',
          variant: 'destructive',
        });
        navigate('/admin-login');
        return;
      }
    } catch {
      localStorage.removeItem('adminToken');
      navigate('/admin-login');
      return;
    }

    // 현재 리포트 개수 가져오기
    loadReportsFromSupabase().then(reports => {
      setTotalReports(reports.length);
    });
  }, [navigate]);

  const handleCleanup = async () => {
    const count = parseInt(keepCount);
    if (isNaN(count) || count < 0) {
      toast({
        title: '유효하지 않은 숫자',
        description: '0 이상의 숫자를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      
      const { data, error } = await supabase.functions.invoke('admin-cleanup', {
        body: { keepCount: count },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: '정리 완료',
          description: data.message,
        });
        
        // 리포트 개수 업데이트
        const reports = await loadReportsFromSupabase();
        setTotalReports(reports.length);
      } else {
        toast({
          title: '정리 실패',
          description: data.error || '정리 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: '오류 발생',
        description: '정리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast({
      title: '로그아웃',
      description: '로그아웃되었습니다.',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-teal-700">관리자 페이지</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-gray-600"
            >
              로그아웃
            </Button>
          </div>

          <div className="space-y-6">
            {/* 현재 상태 */}
            <div className="bg-teal-50 p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-teal-700 mb-2">현재 상태</h2>
              <p className="text-lg">
                총 리포트 개수: <span className="font-bold text-teal-600">{totalReports}개</span>
              </p>
            </div>

            {/* 이미지 정리 */}
            <div className="border border-gray-200 p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">이미지 데이터 정리</h2>
              <p className="text-gray-600 mb-4">
                원하는 개수만큼 최신 리포트를 남기고 나머지를 삭제합니다.
              </p>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="keepCount" className="block text-sm font-medium text-gray-700 mb-2">
                    유지할 리포트 개수
                  </label>
                  <Input
                    id="keepCount"
                    type="number"
                    value={keepCount}
                    onChange={(e) => setKeepCount(e.target.value)}
                    min="0"
                    placeholder="예: 500"
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleCleanup}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? '정리 중...' : '정리 실행'}
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                * 오래된 리포트부터 삭제됩니다. 이미지와 데이터베이스 레코드가 함께 삭제됩니다.
              </p>
            </div>

            {/* 홈으로 */}
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
