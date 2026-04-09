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

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCourses, setPendingCourses] = useState([
    { id: '1', title: 'Blockchain Fundamentals', instructor: 'John Smith', date: '2024-01-15' },
    { id: '2', title: 'AI Ethics', instructor: 'Dr. Jane Doe', date: '2024-01-14' }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

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
    
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>Welcome back, {user?.name}!</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>1,234</div>
          <div style={{ color: '#6b7280' }}>Total Users</div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📚</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>45</div>
          <div style={{ color: '#6b7280' }}>Total Courses</div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>👨‍🏫</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>12</div>
          <div style={{ color: '#6b7280' }}>Instructors</div>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{pendingCourses.length}</div>
          <div style={{ color: '#6b7280' }}>Pending Approvals</div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Pending Course Approvals</h2>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Course</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Instructor</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Submitted</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingCourses.map((course) => (
              <tr key={course.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{course.title}</td>
                <td style={{ padding: '12px' }}>{course.instructor}</td>
                <td style={{ padding: '12px' }}>{course.date}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{ marginRight: '8px', padding: '4px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
                  <button style={{ padding: '4px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
        </DashboardLayout>
    
  );
}