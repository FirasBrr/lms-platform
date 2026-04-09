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

interface Course {
  _id: string;
  title: string;
  description: string;
  students: number;
  rating: number;
  status: string;
  enrolledStudents?: string[];
  createdAt: string;
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'instructor' && userData.role !== 'admin') {
      router.push(`/dashboard/${userData.role}`);
      return;
    }

    setUser(userData);
    fetchCourses(token);
  }, [router]);

  const fetchCourses = async (token: string) => {
    try {
      const res = await fetch('/api/instructor/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0);
  const publishedCourses = courses.filter(c => c.status === 'published').length;
  const draftCourses = courses.filter(c => c.status === 'draft').length;
  const pendingCourses = courses.filter(c => c.status === 'pending').length;
  const avgRating = courses.length > 0 
    ? (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length).toFixed(1)
    : '0';

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
      <div>
        {/* Welcome Section */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Here's what's happening with your courses today.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>📚</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>{courses.length}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>Total Courses</h3>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>✅</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{publishedCourses}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>Published Courses</h3>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>📝</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{draftCourses}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>Draft Courses</h3>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>⏳</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>{pendingCourses}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>Pending Review</h3>
          </div>
        </div>

        {/* Second Row Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>👥</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>{totalStudents.toLocaleString()}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>Total Students</h3>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>⭐</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{avgRating}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>Average Rating</h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <Link
            href="/instructor/courses/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#4f46e5',
              color: 'white',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4338ca'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#4f46e5'}
          >
            <span>➕</span> Create New Course
          </Link>
          <Link
            href="/instructor/courses"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'white',
              color: '#475569',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <span>📋</span> Manage All Courses
          </Link>
        </div>

        {/* Recent Courses Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>Recent Courses</h2>
            {courses.length > 0 && (
              <Link href="/instructor/courses" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                View all →
              </Link>
            )}
          </div>

          {courses.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px', 
              background: 'white', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>No courses yet</h3>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>Create your first course and start teaching!</p>
              <Link 
                href="/instructor/courses/create"
                style={{ 
                  padding: '10px 24px', 
                  background: '#4f46e5', 
                  color: 'white', 
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Create Course
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {courses.slice(0, 5).map((course) => (
                <div 
                  key={course._id} 
                  style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{course.title}</h3>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '20px', 
                          fontSize: '11px',
                          background: course.status === 'published' ? '#d1fae5' : course.status === 'pending' ? '#fef3c7' : '#f1f5f9',
                          color: course.status === 'published' ? '#065f46' : course.status === 'pending' ? '#92400e' : '#64748b'
                        }}>
                          {course.status === 'published' ? 'Published' : course.status === 'pending' ? 'Pending' : 'Draft'}
                        </span>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>
                        {course.description?.substring(0, 100)}...
                      </p>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#64748b' }}>
                        <span>👥 {course.enrolledStudents?.length || 0} students</span>
                        <span>⭐ {course.rating || 'No ratings'}</span>
                        <span>📅 {new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link 
                      href={`/instructor/courses/${course._id}/edit`}
                      style={{ 
                        padding: '6px 16px', 
                        background: '#f1f5f9', 
                        color: '#475569', 
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#4f46e5';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      Edit Course →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}