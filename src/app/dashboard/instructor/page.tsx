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
  students: number;
  rating: number;
  status: string;
  enrolledStudents?: string[];
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
      const res = await fetch('/api/courses?instructor=true', {
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
  const avgRating = (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / (publishedCourses || 1)).toFixed(1);

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
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Instructor Dashboard
            </h1>
            <p style={{ color: '#6b7280' }}>Welcome back, {user?.name}!</p>
          </div>
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
            + Create New Course
          </Link>
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{courses.length}</div>
            <div style={{ color: '#6b7280' }}>Total Courses</div>
          </div>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{publishedCourses}</div>
            <div style={{ color: '#6b7280' }}>Published Courses</div>
          </div>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalStudents.toLocaleString()}</div>
            <div style={{ color: '#6b7280' }}>Total Students</div>
          </div>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⭐</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{avgRating || '—'}</div>
            <div style={{ color: '#6b7280' }}>Average Rating</div>
          </div>
        </div>

        {/* Courses Table */}
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Your Courses</h2>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>Course</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Students</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Rating</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No courses yet. Click "Create New Course" to get started!
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{course.title}</td>
                    <td style={{ padding: '12px' }}>{course.enrolledStudents?.length || 0}</td>
                    <td style={{ padding: '12px' }}>{course.rating || '—'} ★</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        background: course.status === 'published' ? '#d1fae5' : course.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                        color: course.status === 'published' ? '#065f46' : course.status === 'pending' ? '#92400e' : '#6b7280'
                      }}>
                        {course.status === 'published' ? 'Published' : course.status === 'pending' ? 'Pending Review' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link href={`/instructor/courses/${course._id}/edit`} style={{ color: '#4f46e5', textDecoration: 'none' }}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}