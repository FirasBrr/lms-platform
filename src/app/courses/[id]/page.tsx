'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  instructor: {
    name: string;
    email: string;
  };
  lessons: Lesson[];
  enrolledStudents: string[];
  whatYouWillLearn: string[];
  requirements: string[];
  createdAt: string;
}

interface Lesson {
  title: string;
  description: string;
  type: string;
  content: string;
  duration: number;
  order: number;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses?id=${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Course not found</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>The course you're looking for doesn't exist.</p>
        <Link href="/courses" style={{ padding: '10px 24px', background: '#4f46e5', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
          Browse Courses
        </Link>
      </div>
    );
  }

  const totalDuration = course.lessons?.reduce((acc, lesson) => acc + lesson.duration, 0) || 0;
  const totalLessons = course.lessons?.length || 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Section with Thumbnail */}
      <div style={{ position: 'relative' }}>
        {course.thumbnail ? (
          <>
            <img 
              src={course.thumbnail} 
              alt={course.title}
              style={{ 
                width: '100%', 
                height: '400px', 
                objectFit: 'cover',
                filter: 'brightness(0.7)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '40px 24px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              color: 'white'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '20px',
                    fontSize: '14px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {course.category}
                  </span>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '20px',
                    fontSize: '14px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {course.level}
                  </span>
                </div>
                <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>{course.title}</h1>
                <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '16px', maxWidth: '800px' }}>{course.description}</p>
                <div style={{ display: 'flex', gap: '24px', fontSize: '14px', opacity: 0.8 }}>
                  <span>👨‍🏫 {course.instructor?.name}</span>
                  <span>📚 {totalLessons} lessons</span>
                  <span>⏱️ {totalDuration} min total</span>
                  <span>👥 {course.enrolledStudents?.length || 0} students</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '60px 24px',
            color: 'white'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '14px' }}>
                  {course.category}
                </span>
                <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '14px' }}>
                  {course.level}
                </span>
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>{course.title}</h1>
              <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '16px', maxWidth: '800px' }}>{course.description}</p>
              <div style={{ display: 'flex', gap: '24px', fontSize: '14px', opacity: 0.8 }}>
                <span>👨‍🏫 {course.instructor?.name}</span>
                <span>📚 {totalLessons} lessons</span>
                <span>⏱️ {totalDuration} min total</span>
                <span>👥 {course.enrolledStudents?.length || 0} students</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div style={{ padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
          {/* Left Column */}
          <div>
            {/* What You'll Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>What You'll Learn</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {course.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                      <span style={{ fontSize: '20px' }}>✓</span>
                      <span style={{ color: '#374151' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Course Curriculum</h2>
                <span style={{ color: '#6b7280' }}>{totalLessons} lessons • {totalDuration} minutes</span>
              </div>
              
              {totalLessons === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '16px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Coming Soon</h3>
                  <p style={{ color: '#6b7280' }}>Course lessons are being added. Check back soon!</p>
                </div>
              ) : (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
                  {course.lessons.map((lesson, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '20px 24px',
                        borderBottom: idx < totalLessons - 1 ? '1px solid #e5e7eb' : 'none',
                        background: 'white',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ 
                            width: '32px', 
                            height: '32px', 
                            background: '#e0e7ff', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#4f46e5',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {idx + 1}
                          </span>
                          <div>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>{lesson.title}</h3>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>{lesson.description}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            {lesson.type === 'video' ? '🎥' : lesson.type === 'pdf' ? '📄' : '📝'} {lesson.duration} min
                          </span>
                          {user && (
                            <button
                              style={{
                                padding: '6px 16px',
                                background: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              {lesson.type === 'video' ? 'Watch' : 'View'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Requirements Card */}
            {course.requirements && course.requirements.length > 0 && (
              <div style={{ 
                background: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '16px', 
                padding: '24px',
                marginBottom: '24px',
                position: 'sticky',
                top: '100px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Requirements</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {course.requirements.map((req, idx) => (
                    <li key={idx} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                      <span>✓</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Card */}
            <div style={{ 
              background: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '16px', 
              padding: '24px',
              position: 'sticky',
              top: '100px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>About the Instructor</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: 'white'
                }}>
                  {course.instructor?.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>{course.instructor?.name}</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Expert Instructor</p>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                Passionate educator with years of experience in {course.category}. Dedicated to helping students master new skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}