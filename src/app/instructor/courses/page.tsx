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
  category: string;
  level: string;
  status: string;
  enrolledStudents: string[];
  rating: number;
  createdAt: string;
}

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'instructor' && userData.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    setUser(userData);
    fetchCourses(token);
  }, [router]);

 const fetchCourses = async (token: string) => {
  try {
    console.log('Fetching courses...');
    const res = await fetch('/api/instructor/courses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);
    
    if (res.ok) {
      setCourses(data.courses || []);
      console.log('Courses count:', data.courses?.length);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  } finally {
    setLoading(false);
  }
};

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; color: string; text: string }> = {
      draft: { bg: '#f3f4f6', color: '#6b7280', text: 'Draft' },
      pending: { bg: '#fef3c7', color: '#92400e', text: 'Pending Review' },
      published: { bg: '#d1fae5', color: '#065f46', text: 'Published' },
      rejected: { bg: '#fee2e2', color: '#dc2626', text: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span style={{ 
        padding: '4px 12px', 
        borderRadius: '20px', 
        fontSize: '12px',
        background: config.bg,
        color: config.color
      }}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              My Courses
            </h1>
            <p style={{ color: '#6b7280' }}>Manage all your courses</p>
          </div>
          <Link 
            href="/instructor/courses/create"
            style={{ 
              padding: '10px 20px', 
              background: '#4f46e5', 
              color: 'white', 
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            + Create New Course
          </Link>
        </div>

        {courses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            background: 'white', 
            borderRadius: '16px', 
            border: '1px solid #e5e7eb' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>No courses yet</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Create your first course and start teaching!</p>
            <Link 
              href="/instructor/courses/create"
              style={{ 
                padding: '10px 20px', 
                background: '#4f46e5', 
                color: 'white', 
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              Create Course
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {courses.map((course) => (
              <div key={course._id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb',
                padding: '20px',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{course.title}</h2>
                      {getStatusBadge(course.status)}
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                      {course.description.length > 150 
                        ? course.description.substring(0, 150) + '...' 
                        : course.description}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280', flexWrap: 'wrap' }}>
                      <span>📚 {course.category}</span>
                      <span>📊 {course.level}</span>
                      <span>👥 {course.enrolledStudents?.length || 0} students</span>
                      <span>⭐ {course.rating || 'No ratings'}</span>
                      <span>📅 {new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link 
                      href={`/instructor/courses/${course._id}/edit`}
                      style={{ 
                        padding: '6px 16px', 
                        background: '#4f46e5', 
                        color: 'white', 
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      Edit
                    </Link>
                    <Link 
                      href={`/courses/${course._id}`}
                      target="_blank"
                      style={{ 
                        padding: '6px 16px', 
                        background: 'white', 
                        border: '1px solid #e5e7eb',
                        color: '#374151', 
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}