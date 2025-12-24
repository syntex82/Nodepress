/**
 * LMS Admin Dashboard - Overview of courses, enrollments, and revenue
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lmsAdminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { FiBook, FiUsers, FiDollarSign, FiTrendingUp, FiPlus, FiEye, FiEdit } from 'react-icons/fi';

interface DashboardStats {
  courses: { total: number; published: number; draft: number };
  enrollments: { total: number; active: number; completed: number };
  revenue: number;
  recentEnrollments: any[];
  topCourses: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const { data } = await lmsAdminApi.getDashboardStats();
      setStats(data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4"><div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-slate-700 border-t-blue-500"></div></div>;
  if (!stats) return <div className="min-h-screen bg-slate-900 p-4 sm:p-6 text-center text-red-400">Failed to load dashboard</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent truncate">LMS Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 hidden sm:block">Manage courses and track enrollments</p>
        </div>
        <Link to="/lms/courses/new" className="flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 transition-all touch-manipulation active:scale-95 text-xs sm:text-sm font-medium whitespace-nowrap min-h-[44px] flex-shrink-0">
          <FiPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden xs:inline sm:inline">Create Course</span>
          <span className="xs:hidden sm:hidden">New</span>
        </Link>
      </div>

      {/* Stats Cards - 2 columns on mobile for better use of space */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Courses Card */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 lg:p-6 border-l-4 border-l-blue-500 touch-manipulation active:scale-[0.98] transition-transform">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 truncate">Total Courses</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tabular-nums mt-0.5 sm:mt-1">{stats.courses.total}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">{stats.courses.published} pub, {stats.courses.draft} draft</p>
            </div>
            <div className="bg-blue-500/20 text-blue-400 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl flex-shrink-0 self-start sm:self-center">
              <FiBook size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>

        {/* Total Enrollments Card */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 lg:p-6 border-l-4 border-l-green-500 touch-manipulation active:scale-[0.98] transition-transform">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 truncate">Enrollments</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tabular-nums mt-0.5 sm:mt-1">{stats.enrollments.total}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">{stats.enrollments.active} active</p>
            </div>
            <div className="bg-green-500/20 text-green-400 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl flex-shrink-0 self-start sm:self-center">
              <FiUsers size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 lg:p-6 border-l-4 border-l-yellow-500 touch-manipulation active:scale-[0.98] transition-transform">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 truncate">Revenue</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tabular-nums mt-0.5 sm:mt-1">${stats.revenue >= 1000 ? `${(stats.revenue/1000).toFixed(1)}k` : stats.revenue.toFixed(0)}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">Total earnings</p>
            </div>
            <div className="bg-yellow-500/20 text-yellow-400 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl flex-shrink-0 self-start sm:self-center">
              <FiDollarSign size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 lg:p-6 border-l-4 border-l-purple-500 touch-manipulation active:scale-[0.98] transition-transform">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 truncate">Completion</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tabular-nums mt-0.5 sm:mt-1">{stats.enrollments.total > 0 ? ((stats.enrollments.completed / stats.enrollments.total) * 100).toFixed(0) : 0}%</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">{stats.enrollments.completed} done</p>
            </div>
            <div className="bg-purple-500/20 text-purple-400 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl flex-shrink-0 self-start sm:self-center">
              <FiTrendingUp size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Courses */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg sm:rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-700/50 flex items-center justify-between gap-3">
            <h2 className="font-bold text-white text-sm sm:text-base truncate flex-1">Top Courses</h2>
            <Link to="/lms/courses" className="text-blue-400 text-xs sm:text-sm hover:text-blue-300 transition-colors whitespace-nowrap touch-manipulation min-h-[44px] flex items-center px-2 active:text-blue-200">View All</Link>
          </div>
          <div className="divide-y divide-slate-700/50">
            {stats.topCourses.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-slate-500 text-sm">No courses yet</div>
            ) : stats.topCourses.map((course: any) => (
              <div key={course.id} className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 lg:gap-4 hover:bg-slate-700/30 transition-colors touch-manipulation active:bg-slate-700/40">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-xs sm:text-sm lg:text-base truncate">{course.title}</h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 truncate">{course._count?.lessons || 0} lessons • {course._count?.enrollments || 0} students</p>
                </div>
                <div className="flex gap-0.5 sm:gap-1 lg:gap-2 flex-shrink-0">
                  <Link to={`/lms/course/${course.slug}`} className="p-2.5 text-slate-500 hover:text-blue-400 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center active:text-blue-300 rounded-lg hover:bg-slate-700/30" aria-label="View course"><FiEye size={16} className="sm:w-[18px] sm:h-[18px]" /></Link>
                  <Link to={`/lms/courses/${course.id}`} className="p-2.5 text-slate-500 hover:text-green-400 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center active:text-green-300 rounded-lg hover:bg-slate-700/30" aria-label="Edit course"><FiEdit size={16} className="sm:w-[18px] sm:h-[18px]" /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg sm:rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-slate-700/50"><h2 className="font-bold text-white text-sm sm:text-base">Recent Enrollments</h2></div>
          <div className="divide-y divide-slate-700/50">
            {stats.recentEnrollments.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-slate-500 text-sm">No enrollments yet</div>
            ) : stats.recentEnrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 lg:gap-4 hover:bg-slate-700/30 transition-colors touch-manipulation">
                <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-medium text-xs sm:text-sm flex-shrink-0">
                  {enrollment.user?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-xs sm:text-sm lg:text-base truncate">{enrollment.user?.name || 'Unknown'}</h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-400 truncate">{enrollment.course?.title}</p>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap flex-shrink-0 hidden xs:block">{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

