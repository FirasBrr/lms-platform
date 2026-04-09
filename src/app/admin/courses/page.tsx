'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    email: string;
  };
  category: string;
  level: string;
  status: string;
  enrolledStudents: string[];
  rating: number;
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

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

    setAdminUser(userData);
    fetchCourses(token);
  }, [router]);

  const fetchCourses = async (token: string) => {
    try {
      const res = await fetch('/api/admin/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleUpdateStatus = async (courseId: string, newStatus: string) => {
    setUpdating(courseId);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Update the course in the local state
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId ? { ...course, status: newStatus } : course
          )
        );
        alert(`Course ${newStatus === 'published' ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert(data.error || 'Failed to update course status');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setCourses(courses.filter(course => course._id !== courseId));
        alert('Course deleted successfully');
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.instructor?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    pending: courses.filter(c => c.status === 'pending').length,
    draft: courses.filter(c => c.status === 'draft').length,
    rejected: courses.filter(c => c.status === 'rejected').length,
    totalStudents: courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; color: string; text: string }> = {
      published: { bg: '#d1fae5', color: '#065f46', text: 'Published' },
      pending: { bg: '#fef3c7', color: '#92400e', text: 'Pending Review' },
      draft: { bg: '#f1f5f9', color: '#64748b', text: 'Draft' },
      rejected: { bg: '#fee2e2', color: '#dc2626', text: 'Rejected' },
    };
    const style = config[status] || config.draft;
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        background: style.bg,
        color: style.color,
      }}>
        {style.text}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout user={adminUser}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={adminUser}>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            Manage Courses
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Review, approve, and manage all courses on the platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>{stats.total}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Courses</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>{stats.published}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Published</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Pending Review</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#4f46e5' }}>{stats.totalStudents}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Students</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by course or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                width: '260px',
                fontSize: '14px',
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                background: 'white',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending Review</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {/* Courses Table */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0', 
          overflow: 'auto' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Course</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Instructor</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Category</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Students</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>{course.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{course.level}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#475569' }}>{course.instructor?.name || 'Unknown'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: '#e0e7ff',
                        color: '#4f46e5',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                      }}>
                        {course.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#475569' }}>{course.enrolledStudents?.length || 0}</td>
                    <td style={{ padding: '16px' }}>{getStatusBadge(course.status)}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Show Approve/Reject for pending courses */}
                        {course.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(course._id, 'published')}
                              disabled={updating === course._id}
                              style={{
                                padding: '6px 12px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: updating === course._id ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                opacity: updating === course._id ? 0.6 : 1,
                              }}
                            >
                              {updating === course._id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(course._id, 'rejected')}
                              disabled={updating === course._id}
                              style={{
                                padding: '6px 12px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: updating === course._id ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                opacity: updating === course._id ? 0.6 : 1,
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {/* Show Publish button for draft courses */}
                        {course.status === 'draft' && (
                          <button
                            onClick={() => handleUpdateStatus(course._id, 'published')}
                            style={{
                              padding: '6px 12px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            Publish
                          </button>
                        )}
                        <Link
                          href={`/courses/${course._id}`}
                          target="_blank"
                          style={{
                            padding: '6px 12px',
                            background: '#f1f5f9',
                            color: '#475569',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '500',
                          }}
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          style={{
                            padding: '6px 12px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                          }}
                        >
                          Delete
                        </button>
                      </div>
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