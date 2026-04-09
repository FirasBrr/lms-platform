'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';  // ADD THIS IMPORT

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      instructor: 'Sarah Johnson',
      progress: 65,
      image: '💻',
      duration: '40 hours'
    },
    {
      id: '2',
      title: 'Machine Learning Fundamentals',
      instructor: 'Dr. Michael Chen',
      progress: 30,
      image: '🤖',
      duration: '35 hours'
    },
    {
      id: '3',
      title: 'UI/UX Design Masterclass',
      instructor: 'Emma Rodriguez',
      progress: 80,
      image: '🎨',
      duration: '28 hours'
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

  const totalProgress = Math.floor(
    enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length
  );

  const completedCourses = enrolledCourses.filter(c => c.progress === 100).length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // WRAP YOUR CONTENT WITH DashboardLayout
  return (
    <DashboardLayout user={user}>
      <div>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: '#6b7280' }}>Continue your learning journey</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{enrolledCourses.length}</div>
            <div style={{ color: '#6b7280' }}>Enrolled Courses</div>
          </div>
          
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalProgress}%</div>
            <div style={{ color: '#6b7280' }}>Average Progress</div>
          </div>
          
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{completedCourses}</div>
            <div style={{ color: '#6b7280' }}>Completed Courses</div>
          </div>
          
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>4.8</div>
            <div style={{ color: '#6b7280' }}>Average Rating</div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>My Courses</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {enrolledCourses.map((course) => (
              <div key={course.id} style={{ 
                background: 'white', 
                borderRadius: '16px', 
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  height: '140px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  {course.image}
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{course.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>{course.instructor}</p>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Progress</span>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{course.progress}%</span>
                    </div>
                    <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${course.progress}%`, 
                        height: '100%', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }} />
                    </div>
                  </div>
                  <Link 
                    href={`/courses/${course.id}`}
                    style={{ 
                      display: 'block',
                      textAlign: 'center',
                      padding: '10px', 
                      background: '#4f46e5', 
                      color: 'white', 
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Continue Learning →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}