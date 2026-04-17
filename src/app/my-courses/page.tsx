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
    thumbnail: string;
    category: string;
    level: string;
    instructor: {
      name: string;
    };
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
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'student') {
      router.push(`/dashboard/${userData.role}`);
      return;
    }

    setUser(userData);
    fetchEnrolledCourses();
  }, [router]);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await fetch('/api/enroll');
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

  const handleUnenroll = async (courseId: string) => {
    if (!confirm('Are you sure you want to unenroll from this course?')) return;
    
    try {
      const res = await fetch(`/api/enroll?courseId=${courseId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setEnrolledCourses(enrolledCourses.filter(c => c.courseId._id !== courseId));
        alert('Successfully unenrolled from course');
      } else {
        alert('Failed to unenroll');
      }
    } catch (error) {
      console.error('Error unenrolling:', error);
      alert('Something went wrong');
    }
  };

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
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            My Courses
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Continue learning where you left off
          </p>
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
          <div style={{ display: 'grid', gap: '20px' }}>
            {enrolledCourses.map((enrollment, idx) => {
              const isCompleted = enrollment.progress === 100;
              
              return (
                <div 
                  key={idx} 
                  style={{ 
                    background: isCompleted ? '#f0fdf4' : 'white', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Course Thumbnail */}
                    <div style={{
                      width: '160px',
                      height: '120px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px'
                    }}>
                      {enrollment.courseId?.thumbnail ? (
                        <img src={enrollment.courseId.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                      ) : (
                        '📚'
                      )}
                    </div>
                    
                    {/* Course Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                            {enrollment.courseId?.title || 'Course'}
                            {isCompleted && (
                              <span style={{ 
                                marginLeft: '12px', 
                                padding: '2px 8px', 
                                background: '#10b981', 
                                color: 'white', 
                                borderRadius: '20px',
                                fontSize: '11px'
                              }}>
                                Completed ✓
                              </span>
                            )}
                          </h3>
                          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                            {enrollment.courseId?.instructor?.name}
                          </p>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                            <span>📚 {enrollment.courseId?.category}</span>
                            <span>📊 {enrollment.courseId?.level}</span>
                            <span>📅 Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {isCompleted ? (
                            <>
                              <Link
                                href="/certificates"
                                style={{
                                  display: 'inline-block',
                                  padding: '8px 20px',
                                  background: '#10b981',
                                  color: 'white',
                                  borderRadius: '8px',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  marginRight: '8px'
                                }}
                              >
                                🎓 View Certificate
                              </Link>
                              <Link
                                href={`/courses/${enrollment.courseId?._id}`}
                                style={{
                                  display: 'inline-block',
                                  padding: '8px 16px',
                                  background: 'white',
                                  color: '#4f46e5',
                                  border: '1px solid #4f46e5',
                                  borderRadius: '8px',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                  marginRight: '8px'
                                }}
                              >
                                Review Course
                              </Link>
                            </>
                          ) : (
                            <Link
                              href={`/courses/${enrollment.courseId?._id}`}
                              style={{
                                display: 'inline-block',
                                padding: '8px 20px',
                                background: '#4f46e5',
                                color: 'white',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginRight: '8px'
                              }}
                            >
                              Continue Learning →
                            </Link>
                          )}
                          <button
                            onClick={() => handleUnenroll(enrollment.courseId?._id)}
                            style={{
                              padding: '8px 16px',
                              background: 'white',
                              color: '#dc2626',
                              border: '1px solid #fee2e2',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Unenroll
                          </button>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>Your Progress</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: isCompleted ? '#10b981' : '#4f46e5' }}>
                            {enrollment.progress}%
                          </span>
                        </div>
                        <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${enrollment.progress}%`, 
                            height: '100%', 
                            background: isCompleted ? '#10b981' : 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                            borderRadius: '10px'
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}