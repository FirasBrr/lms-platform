'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LessonViewer from '@/components/LessonViewer';
import Chatbot from '@/components/Chatbot';

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
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);

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
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          const enrolled = data.course.enrolledStudents?.includes(userData.id);
          setIsEnrolled(enrolled);
          
          if (enrolled) {
            fetchProgress();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch(`/api/progress?courseId=${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setProgress(data.progress || 0);
        setCompletedLessons(data.completedLessons || []);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    const isCompleted = completedLessons.includes(lesson.title);
    setLessonCompleted(isCompleted);
  };

  const handleLessonComplete = async () => {
    await fetchProgress();
    setLessonCompleted(true);
    await fetchCourse();
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId: params.id })
      });

      if (res.ok) {
        setIsEnrolled(true);
        alert('Successfully enrolled in course!');
        fetchProgress();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Course not found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>The course you're looking for doesn't exist.</p>
        <Link href="/courses" style={{ padding: '10px 24px', background: '#4f46e5', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
          Browse Courses
        </Link>
      </div>
    );
  }

  const totalLessons = course.lessons?.length || 0;
  const completedCount = completedLessons.length;

  return (
    <>
      {/* Back Button */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px 0 24px' }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#475569',
            transition: 'all 0.2s'
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
          ← Back to Courses
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px 40px 24px' }}>
        {/* Hero Section */}
        <div style={{ 
          background: course.thumbnail ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          {course.thumbnail ? (
            <>
              <img 
                src={course.thumbnail} 
                alt={course.title}
                style={{ 
                  width: '100%', 
                  height: '400px', 
                  objectFit: 'cover',
                }}
              />
              <div style={{
                marginTop: '-80px',
                padding: '40px 32px',
                background: 'white',
                borderRadius: '24px 24px 0 0',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 14px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}>
                    {course.category}
                  </span>
                  <span style={{ padding: '6px 14px', background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}>
                    {course.level}
                  </span>
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>{course.title}</h1>
                <p style={{ fontSize: '18px', color: '#475569', marginBottom: '24px', lineHeight: '1.6' }}>{course.description}</p>
                <div style={{ display: 'flex', gap: '32px', fontSize: '14px', color: '#64748b', flexWrap: 'wrap' }}>
                  <span>👨‍🏫 {course.instructor?.name}</span>
                  <span>📚 {totalLessons} lessons</span>
                  <span>👥 {course.enrolledStudents?.length || 0} students</span>
                  {isEnrolled && <span>📊 Your Progress: {progress}%</span>}
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 40px', color: 'white' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '14px' }}>
                  {course.category}
                </span>
                <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '14px' }}>
                  {course.level}
                </span>
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>{course.title}</h1>
              <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px', maxWidth: '800px' }}>{course.description}</p>
              <div style={{ display: 'flex', gap: '32px', fontSize: '14px', opacity: 0.8, flexWrap: 'wrap' }}>
                <span>👨‍🏫 {course.instructor?.name}</span>
                <span>📚 {totalLessons} lessons</span>
                <span>👥 {course.enrolledStudents?.length || 0} students</span>
                {isEnrolled && <span>📊 Your Progress: {progress}%</span>}
              </div>
            </div>
          )}
        </div>

        {/* Enrollment Button for non-enrolled users */}
        {!isEnrolled && user && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            padding: '24px',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Ready to start learning?</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Enroll now and begin your learning journey!</p>
            <button
              onClick={handleEnroll}
              style={{
                padding: '12px 32px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4338ca'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#4f46e5'}
            >
              Enroll Now - Free
            </button>
          </div>
        )}

        {/* Progress Bar for enrolled users */}
        {isEnrolled && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            padding: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Your Progress</span>
              <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>{progress}% Complete</span>
            </div>
            <div style={{ background: '#e2e8f0', height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                borderRadius: '10px',
                transition: 'width 0.3s'
              }} />
            </div>
            <div style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>
              {completedCount} of {totalLessons} lessons completed
            </div>
            {progress === 100 && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                background: '#d1fae5', 
                borderRadius: '10px', 
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <span>🎓 Congratulations! You have completed this course!</span>
                <Link 
                  href="/certificates" 
                  style={{ 
                    color: '#4f46e5', 
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  View your certificate →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Course Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Left Column - Lessons */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              Course Curriculum
            </h2>
            
            {totalLessons === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Coming Soon</h3>
                <p style={{ color: '#64748b' }}>Course lessons are being added. Check back soon!</p>
              </div>
            ) : (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                {course.lessons.map((lesson, idx) => {
                  const isCompleted = completedLessons.includes(lesson.title);
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '20px 24px',
                        borderBottom: idx < totalLessons - 1 ? '1px solid #e2e8f0' : 'none',
                        background: isCompleted ? '#f0fdf4' : 'white',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleOpenLesson(lesson)}
                      onMouseEnter={(e) => {
                        if (!isCompleted) {
                          e.currentTarget.style.background = '#f8fafc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCompleted) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            background: isCompleted ? '#10b981' : '#e0e7ff', 
                            borderRadius: '10px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: isCompleted ? 'white' : '#4f46e5',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {idx + 1}
                          </div>
                          <div>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e293b' }}>{lesson.title}</h3>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>{lesson.description}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '14px', color: '#64748b' }}>
                            {lesson.type === 'video' ? '🎥' : lesson.type === 'pdf' ? '📄' : '📝'} {lesson.duration} min
                          </span>
                          {isCompleted && (
                            <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}>✓ Completed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* What You'll Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>What You'll Learn</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {course.whatYouWillLearn.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' }}>
                      <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>Requirements</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {course.requirements.map((req, idx) => (
                    <li key={idx} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' }}>
                      <span>📌</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Card */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>About the Instructor</h3>
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
                  <h4 style={{ fontWeight: 'bold', color: '#1e293b' }}>{course.instructor?.name}</h4>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Expert Instructor</p>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                Passionate educator with years of experience in {course.category}. Dedicated to helping students master new skills.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Viewer Modal */}
      {selectedLesson && (
        <LessonViewer
          lesson={selectedLesson}
          courseId={course._id}
          courseTitle={course.title}
          onClose={() => setSelectedLesson(null)}
          onComplete={handleLessonComplete}
          isCompleted={lessonCompleted}
        />
      )}

      {/* AI Chatbot */}
      <Chatbot 
        courseContext={`Course: ${course.title}. Description: ${course.description}`}
        courseTitle={course.title}
      />
    </>
  );
}