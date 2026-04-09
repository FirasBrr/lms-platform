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
  const [isEnrolled, setIsEnrolled] = useState(false);
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
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setIsEnrolled(data.course.enrolledStudents?.includes(userData.id));
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: params.id })
      });

      if (res.ok) {
        setIsEnrolled(true);
        alert('Successfully enrolled in course!');
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
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Course not found</h2>
        <Link href="/courses">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Course Header with Thumbnail */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        {/* Thumbnail Image */}
        {course.thumbnail && (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            style={{ 
              width: '100%', 
              height: '300px', 
              objectFit: 'cover',
              display: 'block'
            }}
          />
        )}
        
        {/* Course Info Overlay */}
        <div style={{ 
          padding: course.thumbnail ? '24px' : '40px',
          color: 'white',
          background: course.thumbnail ? 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))' : 'transparent'
        }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>{course.title}</h1>
          <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '24px' }}>{course.description}</p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <span>📚 {course.category}</span>
            <span>📊 {course.level}</span>
            <span>👨‍🏫 {course.instructor?.name}</span>
            <span>👥 {course.enrolledStudents?.length || 0} students</span>
          </div>
          {!isEnrolled && user && (
            <button
              onClick={handleEnroll}
              style={{
                marginTop: '24px',
                padding: '12px 32px',
                background: 'white',
                color: '#4f46e5',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Enroll Now - Free
            </button>
          )}
          {isEnrolled && (
            <div style={{ marginTop: '24px', padding: '12px 24px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'inline-block' }}>
              ✅ You are enrolled in this course
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column - What You'll Learn & Lessons */}
        <div>
          {/* What You'll Learn */}
          {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>What You'll Learn</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {course.whatYouWillLearn.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✅</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lessons */}
          {course.lessons && course.lessons.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Course Content</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {course.lessons.map((lesson, idx) => (
                  <div key={idx} style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{idx + 1}. {lesson.title}</span>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{lesson.description}</p>
                      </div>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>⏱️ {lesson.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Requirements */}
        <div>
          {course.requirements && course.requirements.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Requirements</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {course.requirements.map((req, idx) => (
                  <li key={idx} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📌</span> {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}