'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LessonViewer from '@/components/LessonViewer';

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
  const [updating, setUpdating] = useState<string | null>(null);
  const [generatingCert, setGeneratingCert] = useState(false);
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

  const generateCertificate = async () => {
    if (generatingCert) return;
    
    setGeneratingCert(true);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId: params.id })
      });

      const data = await res.json();
      
      if (res.ok) {
        alert('🎓 Certificate generated! You can download it from the Certificates page.');
      } else {
        if (data.error !== 'Certificate already exists') {
          console.error('Error generating certificate:', data.error);
        }
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setGeneratingCert(false);
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
  
  if (progress + (100 / totalLessons) >= 100) {
    await generateCertificate();
  }
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
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
                    <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '14px' }}>
                      {course.category}
                    </span>
                    <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '14px' }}>
                      {course.level}
                    </span>
                  </div>
                  <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>{course.title}</h1>
                  <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '16px', maxWidth: '800px' }}>{course.description}</p>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '14px', opacity: 0.8, flexWrap: 'wrap' }}>
                    <span>👨‍🏫 {course.instructor?.name}</span>
                    <span>📚 {totalLessons} lessons</span>
                    <span>👥 {course.enrolledStudents?.length || 0} students</span>
                    {isEnrolled && <span>📊 Your Progress: {progress}%</span>}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '60px 24px', color: 'white' }}>
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
                <div style={{ display: 'flex', gap: '24px', fontSize: '14px', opacity: 0.8, flexWrap: 'wrap' }}>
                  <span>👨‍🏫 {course.instructor?.name}</span>
                  <span>📚 {totalLessons} lessons</span>
                  <span>👥 {course.enrolledStudents?.length || 0} students</span>
                  {isEnrolled && <span>📊 Your Progress: {progress}%</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enrollment Button for non-enrolled users */}
        {!isEnrolled && user && (
          <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <button
              onClick={handleEnroll}
              style={{
                padding: '12px 32px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Enroll Now - Free
            </button>
          </div>
        )}

        {/* Progress Bar for enrolled users */}
        {isEnrolled && (
          <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: '500' }}>Your Progress</span>
              <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>{progress}% Complete</span>
            </div>
            <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', borderRadius: '10px', transition: 'width 0.3s' }} />
            </div>
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
              {completedCount} of {totalLessons} lessons completed
            </div>
            {progress === 100 && (
              <div style={{ marginTop: '12px', padding: '10px 16px', background: '#d1fae5', borderRadius: '8px', color: '#065f46' }}>
                🎓 Congratulations! You have completed this course! 
                <Link href="/certificates" style={{ marginLeft: '12px', color: '#4f46e5', textDecoration: 'underline' }}>
                  View your certificate →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Course Content */}
        <div style={{ padding: '48px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
            {/* Left Column - Lessons */}
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Course Curriculum</h2>
              
              {totalLessons === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '16px' }}>
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
                          transition: 'background 0.2s',
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
                            <span style={{ 
                              width: '32px', 
                              height: '32px', 
                              background: isCompleted ? '#10b981' : '#e0e7ff', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: isCompleted ? 'white' : '#4f46e5',
                              fontWeight: 'bold',
                              fontSize: '14px'
                            }}>
                              {idx + 1}
                            </span>
                            <div>
                              <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>{lesson.title}</h3>
                              <p style={{ fontSize: '14px', color: '#64748b' }}>{lesson.description}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>
                              {lesson.type === 'video' ? '🎥' : lesson.type === 'pdf' ? '📄' : '📝'} {lesson.duration} min
                            </span>
                            {isCompleted && (
                              <span style={{ color: '#10b981', fontSize: '14px' }}>✓ Completed</span>
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
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>What You'll Learn</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {course.whatYouWillLearn.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569' }}>
                        <span>✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Requirements</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {course.requirements.map((req, idx) => (
                      <li key={idx} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569' }}>
                        <span>📌</span> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructor Card */}
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', position: 'sticky', top: '100px' }}>
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
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Expert Instructor</p>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                  Passionate educator with years of experience in {course.category}. Dedicated to helping students master new skills.
                </p>
              </div>
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
    </>
  );
}