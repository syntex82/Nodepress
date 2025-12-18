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

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div></div>;
  if (!stats) return <div className="min-h-screen bg-slate-900 p-6 text-center text-red-400">Failed to load dashboard</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">LMS Dashboard</h1>
        <Link to="/lms/courses/new" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 transition-all">
          <FiPlus /> Create Course
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Courses</p>
              <p className="text-3xl font-bold text-white">{stats.courses.total}</p>
              <p className="text-xs text-slate-500 mt-1">{stats.courses.published} published, {stats.courses.draft} draft</p>
            </div>
            <div className="bg-blue-500/20 text-blue-400 p-3 rounded-xl"><FiBook size={24} /></div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Enrollments</p>
              <p className="text-3xl font-bold text-white">{stats.enrollments.total}</p>
              <p className="text-xs text-slate-500 mt-1">{stats.enrollments.active} active, {stats.enrollments.completed} completed</p>
            </div>
            <div className="bg-green-500/20 text-green-400 p-3 rounded-xl"><FiUsers size={24} /></div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Revenue</p>
              <p className="text-3xl font-bold text-white">${stats.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-500/20 text-yellow-400 p-3 rounded-xl"><FiDollarSign size={24} /></div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Completion Rate</p>
              <p className="text-3xl font-bold text-white">{stats.enrollments.total > 0 ? ((stats.enrollments.completed / stats.enrollments.total) * 100).toFixed(0) : 0}%</p>
            </div>
            <div className="bg-purple-500/20 text-purple-400 p-3 rounded-xl"><FiTrendingUp size={24} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="font-bold text-white">Top Courses</h2>
            <Link to="/lms/courses" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">View All</Link>
          </div>
          <div className="divide-y divide-slate-700/50">
            {stats.topCourses.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No courses yet</div>
            ) : stats.topCourses.map((course: any) => (
              <div key={course.id} className="p-4 flex items-center gap-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-white">{course.title}</h3>
                  <p className="text-sm text-slate-400">{course._count?.lessons || 0} lessons • {course._count?.enrollments || 0} students</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/lms/course/${course.slug}`} className="p-2 text-slate-500 hover:text-blue-400 transition-colors"><FiEye /></Link>
                  <Link to={`/lms/courses/${course.id}`} className="p-2 text-slate-500 hover:text-green-400 transition-colors"><FiEdit /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50"><h2 className="font-bold text-white">Recent Enrollments</h2></div>
          <div className="divide-y divide-slate-700/50">
            {stats.recentEnrollments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No enrollments yet</div>
            ) : stats.recentEnrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="p-4 flex items-center gap-4 hover:bg-slate-700/30 transition-colors">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-medium">
                  {enrollment.user?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{enrollment.user?.name || 'Unknown'}</h3>
                  <p className="text-sm text-slate-400">Enrolled in {enrollment.course?.title}</p>
                </div>
                <span className="text-xs text-slate-500">{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

