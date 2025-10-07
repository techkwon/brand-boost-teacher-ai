import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { loadReportsFromSupabase } from '@/services/supabaseService';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keepCount, setKeepCount] = useState('500');
  const [isLoading, setIsLoading] = useState(false);
  const [totalReports, setTotalReports] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // 세션 확인
    const sessionAuth = sessionStorage.getItem('adminAuth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      loadReports();
    }
  }, []);

  const loadReports = async () => {
    try {
      const reports = await loadReportsFromSupabase();
      setTotalReports(reports.length);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { password }
      });

      if (error) throw error;

      if (data.success) {
        sessionStorage.setItem('adminAuth', 'true');
        setIsAuthenticated(true);
        toast({
          title: '인증 성공',
          description: '관리자 페이지에 접속했습니다.',
        });
        loadReports();
      } else {
        toast({
          title: '인증 실패',
          description: '비밀번호를 확인해주세요.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: '오류 발생',
        description: '인증 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

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
      const { data, error } = await supabase.functions.invoke('admin-cleanup', {
        body: { keepCount: count },
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('adminAuth')}`
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: '정리 완료',
          description: data.message,
        });
        
        loadReports();
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
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setPassword('');
    toast({
      title: '로그아웃',
      description: '로그아웃되었습니다.',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold text-teal-700 mb-6 text-center">관리자 인증</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호를 입력하세요"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              인증
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          </form>
        </div>
      </div>
    );
  }

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
