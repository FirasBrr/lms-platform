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

interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  image: string;
  duration: string;
  category?: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      instructor: 'Sarah Johnson',
      progress: 65,
      image: '💻',
      duration: '40 hours',
      category: 'Programming'
    },
    {
      id: '2',
      title: 'Machine Learning Fundamentals',
      instructor: 'Dr. Michael Chen',
      progress: 30,
      image: '🤖',
      duration: '35 hours',
      category: 'AI/ML'
    },
    {
      id: '3',
      title: 'UI/UX Design Masterclass',
      instructor: 'Emma Rodriguez',
      progress: 80,
      image: '🎨',
      duration: '28 hours',
      category: 'Design'
    }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'student') {
      router.push(`/dashboard/${userData.role}`);
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

  const totalProgress = enrolledCourses.length > 0
    ? Math.floor(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length)
    : 0;

  const completedCourses = enrolledCourses.filter(c => c.progress === 100).length;
  const inProgressCourses = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length;

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
            Continue your learning journey and track your progress.
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
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>{enrolledCourses.length}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>Enrolled Courses</h3>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>📊</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{totalProgress}%</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>Average Progress</h3>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>✅</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{completedCourses}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>Completed Courses</h3>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>🎯</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>{inProgressCourses}</span>
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', margin: 0 }}>In Progress</h3>
          </div>
        </div>

        {/* Continue Learning Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>Continue Learning</h2>
            {enrolledCourses.length > 0 && (
              <Link href="/my-courses" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                View all →
              </Link>
            )}
          </div>

          {enrolledCourses.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px', 
              background: 'white', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>No courses yet</h3>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>Browse our courses and start learning today!</p>
              <Link 
                href="/courses"
                style={{ 
                  padding: '10px 24px', 
                  background: '#4f46e5', 
                  color: 'white', 
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              {enrolledCourses.map((course) => (
                <div 
                  key={course.id} 
                  style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Course Image/Icon */}
                  <div style={{ 
                    height: '140px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    position: 'relative'
                  }}>
                    {course.image}
                    {course.category && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        padding: '4px 8px',
                        background: 'rgba(0,0,0,0.6)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: 'white'
                      }}>
                        {course.category}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                      {course.title}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
                      👨‍🏫 {course.instructor}
                    </p>
                    
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Progress</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>{course.progress}%</span>
                      </div>
                      <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${course.progress}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                          borderRadius: '10px',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        ⏱️ {course.duration}
                      </span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        📖 {course.progress === 100 ? 'Completed' : `${course.progress}% done`}
                      </span>
                    </div>
                    
                    <Link 
                      href={`/courses/${course.id}`}
                      style={{ 
                        display: 'block',
                        textAlign: 'center',
                        padding: '10px 16px', 
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
                      {course.progress === 100 ? 'Review Course →' : 'Continue Learning →'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Courses Section */}
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>Recommended For You</h2>
            <Link href="/courses" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
              Browse all →
            </Link>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px'
          }}>
            {[
              { title: 'Advanced React Patterns', students: '5.2k', rating: 4.9, image: '⚛️', level: 'Advanced' },
              { title: 'Python for Data Science', students: '8.1k', rating: 4.8, image: '🐍', level: 'Intermediate' },
              { title: 'Cloud Computing with AWS', students: '3.7k', rating: 4.7, image: '☁️', level: 'Intermediate' }
            ].map((course, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center' }}>{course.image}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', textAlign: 'center' }}>
                  {course.title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '12px', fontSize: '13px', color: '#64748b' }}>
                  <span>👥 {course.students}</span>
                  <span>⭐ {course.rating}</span>
                  <span>{course.level}</span>
                </div>
                <Link 
                  href={`/courses/${idx + 4}`}
                  style={{ 
                    display: 'block',
                    textAlign: 'center',
                    padding: '8px 16px', 
                    border: '1px solid #4f46e5', 
                    color: '#4f46e5', 
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4f46e5';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#4f46e5';
                  }}
                >
                  View Course
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}