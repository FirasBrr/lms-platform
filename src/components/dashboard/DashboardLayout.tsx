'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Navigation items based on role
  const getNavItems = () => {
    if (user?.role === 'student') {
      return [
        { href: '/dashboard/student', icon: '📊', label: 'Overview' },
        { href: '/my-courses', icon: '📚', label: 'My Courses' },
        { href: '/my-progress', icon: '📈', label: 'My Progress' },
        { href: '/profile', icon: '👤', label: 'Profile' },
        { href: '/settings', icon: '⚙️', label: 'Settings' },
      ];
    }

    if (user?.role === 'instructor') {
      return [
        { href: '/dashboard/instructor', icon: '📊', label: 'Overview' },
        { href: '/instructor/courses', icon: '✏️', label: 'My Courses' },
        { href: '/instructor/students', icon: '👥', label: 'My Students' },
        { href: '/instructor/earnings', icon: '💰', label: 'Earnings' },
        { href: '/profile', icon: '👤', label: 'Profile' },
        { href: '/settings', icon: '⚙️', label: 'Settings' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { href: '/dashboard/admin', icon: '📊', label: 'Overview' },
        { href: '/admin/users', icon: '👥', label: 'Users' },
        { href: '/admin/courses', icon: '📚', label: 'Courses' },
        { href: '/admin/reports', icon: '📊', label: 'Reports' },
        { href: '/profile', icon: '👤', label: 'Profile' },
        { href: '/settings', icon: '⚙️', label: 'Settings' },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '260px' : '70px',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          transition: 'width 0.3s ease',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflowX: 'hidden',
        }}
      >
        <div style={{ padding: '20px' }}>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              marginBottom: '24px',
              padding: '8px',
              borderRadius: '8px',
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          {/* Logo */}
          {sidebarOpen && (
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                marginBottom: '32px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: '#4f46e5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                L
              </div>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>LMS Platform</span>
            </Link>
          )}

          {/* User Info */}
          {sidebarOpen && user && (
            <div
              style={{
                padding: '12px',
                background: '#f3f4f6',
                borderRadius: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#4f46e5',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                {user.name?.charAt(0) || 'U'}
              </div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
              <div
                style={{
                  marginTop: '6px',
                  padding: '2px 8px',
                  background: '#e0e7ff',
                  color: '#4f46e5',
                  borderRadius: '4px',
                  fontSize: '10px',
                  display: 'inline-block',
                  textTransform: 'capitalize',
                }}
              >
                {user.role}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: pathname === item.href ? '#4f46e5' : '#4b5563',
                  background: pathname === item.href ? '#e0e7ff' : 'transparent',
                  marginBottom: '4px',
                  fontSize: '14px',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: '#dc2626',
              cursor: 'pointer',
              marginTop: '24px',
              fontSize: '14px',
            }}
          >
            <span style={{ fontSize: '18px' }}>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarOpen ? '260px' : '70px',
          flex: 1,
          transition: 'margin-left 0.3s ease',
          width: '100%',
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              {user?.role === 'student' && 'Student Dashboard'}
              {user?.role === 'instructor' && 'Instructor Dashboard'}
              {user?.role === 'admin' && 'Admin Dashboard'}
            </h1>
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}