'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PendingCourse {
  _id: string;
  title: string;
  instructor: {
    name: string;
  };
  createdAt: string;
  category: string;
  level: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    publishedCourses: 0,
    pendingCourses: 0,
    rejectedCourses: 0,
    draftCourses: 0,
  });
  const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    setUser(userData);
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      
      // Fetch courses
      const coursesRes = await fetch('/api/admin/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      
      if (usersRes.ok && coursesRes.ok) {
        const users = usersData.users || [];
        const courses = coursesData.courses || [];
        
        setStats({
          totalUsers: users.length,
          totalCourses: courses.length,
          totalInstructors: users.filter((u: any) => u.role === 'instructor').length,
          publishedCourses: courses.filter((c: any) => c.status === 'published').length,
          pendingCourses: courses.filter((c: any) => c.status === 'pending').length,
          rejectedCourses: courses.filter((c: any) => c.status === 'rejected').length,
          draftCourses: courses.filter((c: any) => c.status === 'draft').length,
        });
        
        setPendingCourses(courses.filter((c: any) => c.status === 'pending'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'published' })
      });
      
      if (res.ok) {
        setPendingCourses(pendingCourses.filter(c => c._id !== courseId));
        setStats(prev => ({ 
          ...prev, 
          pendingCourses: prev.pendingCourses - 1,
          publishedCourses: prev.publishedCourses + 1
        }));
        alert('Course approved successfully!');
      }
    } catch (error) {
      console.error('Error approving course:', error);
      alert('Failed to approve course');
    }
  };

  const handleReject = async (courseId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      
      if (res.ok) {
        setPendingCourses(pendingCourses.filter(c => c._id !== courseId));
        setStats(prev => ({ 
          ...prev, 
          pendingCourses: prev.pendingCourses - 1,
          rejectedCourses: prev.rejectedCourses + 1
        }));
        alert('Course rejected.');
      }
    } catch (error) {
      console.error('Error rejecting course:', error);
      alert('Failed to reject course');
    }
  };

  // Calculate percentages for chart
  const publishedPercent = stats.totalCourses ? (stats.publishedCourses / stats.totalCourses) * 100 : 0;
  const pendingPercent = stats.totalCourses ? (stats.pendingCourses / stats.totalCourses) * 100 : 0;
  const rejectedPercent = stats.totalCourses ? (stats.rejectedCourses / stats.totalCourses) * 100 : 0;
  const draftPercent = stats.totalCourses ? (stats.draftCourses / stats.totalCourses) * 100 : 0;

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>{stats.totalUsers}</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Total Users</div>
          </div>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.totalCourses}</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Total Courses</div>
          </div>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>👨‍🏫</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.totalInstructors}</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Instructors</div>
          </div>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.pendingCourses}</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Pending Approvals</div>
          </div>
        </div>

        {/* Course Status Chart */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>
            Course Status Overview
          </h2>
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            padding: '24px'
          }}>
            {/* Donut/Progress Chart - Visual representation */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Circular Progress Indicator */}
              <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="20"
                  />
                  {/* Published segment */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${2 * Math.PI * 70 * (publishedPercent / 100)} ${2 * Math.PI * 70}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 80 80)"
                    strokeLinecap="round"
                  />
                  {/* Pending segment */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="20"
                    strokeDasharray={`${2 * Math.PI * 70 * (pendingPercent / 100)} ${2 * Math.PI * 70}`}
                    strokeDashoffset={`-${2 * Math.PI * 70 * (publishedPercent / 100)}`}
                    transform="rotate(-90 80 80)"
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>{stats.totalCourses}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Total Courses</div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }}></div>
                    <span style={{ flex: 1, fontSize: '14px', color: '#475569' }}>Published</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{stats.publishedCourses}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>({publishedPercent.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${publishedPercent}%`, height: '100%', background: '#10b981' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '3px' }}></div>
                    <span style={{ flex: 1, fontSize: '14px', color: '#475569' }}>Pending Review</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{stats.pendingCourses}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>({pendingPercent.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pendingPercent}%`, height: '100%', background: '#f59e0b' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#94a3b8', borderRadius: '3px' }}></div>
                    <span style={{ flex: 1, fontSize: '14px', color: '#475569' }}>Draft</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{stats.draftCourses}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>({draftPercent.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${draftPercent}%`, height: '100%', background: '#94a3b8' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '3px' }}></div>
                    <span style={{ flex: 1, fontSize: '14px', color: '#475569' }}>Rejected</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{stats.rejectedCourses}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>({rejectedPercent.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${rejectedPercent}%`, height: '100%', background: '#ef4444' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '16px',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.publishedCourses}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Published</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingCourses}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Pending</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#94a3b8' }}>{stats.draftCourses}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Draft</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats.rejectedCourses}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Rejected</div>
              </div>
            </div>
          </div>
        </div>

        

        
      </div>
    </DashboardLayout>
  );
}