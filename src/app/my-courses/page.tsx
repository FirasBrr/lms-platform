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
  courseId: {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
  };
  progress: number;
  enrolledAt: string;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchEnrolledCourses(token);
  }, [router]);

  const fetchEnrolledCourses = async (token: string) => {
    try {
      const res = await fetch('/api/enroll', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEnrolledCourses(data.enrolledCourses || []);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          My Courses
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          Continue learning where you left off
        </p>

        {enrolledCourses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>No courses yet</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Browse our courses and start learning today!</p>
            <Link href="/courses" className="btn btn-primary-custom">Browse Courses</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {enrolledCourses.map((enrollment, idx) => (
              <div key={idx} style={{ 
                background: 'white', 
                borderRadius: '16px', 
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'transform 0.2s'
              }}>
                <div style={{ 
                  height: '140px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  {enrollment.courseId?.category === 'Programming' ? '💻' : '📚'}
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {enrollment.courseId?.title || 'Course'}
                  </h3>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Progress</span>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{enrollment.progress}%</span>
                    </div>
                    <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${enrollment.progress}%`, 
                        height: '100%', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }} />
                    </div>
                  </div>
                  <Link 
                    href={`/courses/${enrollment.courseId?._id}`}
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
        )}
      </div>
    </DashboardLayout>
  );
}