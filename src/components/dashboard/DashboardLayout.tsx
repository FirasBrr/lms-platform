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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getNavItems = () => {
    if (user?.role === 'student') {
      return [
        { href: '/dashboard/student', icon: '🏠', label: 'Overview' },
        { href: '/my-courses', icon: '📚', label: 'My Courses' },
        { href: '/my-progress', icon: '📈', label: 'Progress' },
        { href: '/certificates', icon: '🎓', label: 'Certificates' },
        { href: '/profile', icon: '👤', label: 'Profile' },
        { href: '/settings', icon: '⚙️', label: 'Settings' },
      ];
    }

    if (user?.role === 'instructor') {
      return [
        { href: '/dashboard/instructor', icon: '🏠', label: 'Overview' },
        { href: '/instructor/courses', icon: '✏️', label: 'My Courses' },
        { href: '/instructor/courses/create', icon: '➕', label: 'Create Course' },
        { href: '/instructor/students', icon: '👥', label: 'Students' },
        { href: '/profile', icon: '👤', label: 'Profile' },
        { href: '/settings', icon: '⚙️', label: 'Settings' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { href: '/dashboard/admin', icon: '🏠', label: 'Overview' },
        { href: '/admin/users', icon: '👥', label: 'Users' },
        { href: '/admin/courses', icon: '📚', label: 'Courses' },
        { href: '/admin/pending', icon: '⏳', label: 'Pending Reviews' },
        { href: '/admin/analytics', icon: '📊', label: 'Analytics' },
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
    router.push('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
        />
      )}

      {/* Sidebar - Light Theme */}
      <aside
        style={{
          width: sidebarOpen ? '280px' : '80px',
          background: 'white',
          borderRight: '1px solid #e2e8f0',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 999,
          overflowX: 'hidden',
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ padding: '24px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Logo Section */}
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
            {sidebarOpen && (
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🎓
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e293b' }}>LMS Platform</span>
              </Link>
            )}
            <button
              onClick={toggleSidebar}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* User Profile Section - Light */}
          {sidebarOpen && user && (
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '32px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{user.email}</div>
                </div>
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: '#e0e7ff',
                  borderRadius: '20px',
                  fontSize: '11px',
                  color: '#4f46e5',
                  textTransform: 'capitalize',
                  fontWeight: '500',
                }}
              >
                {user.role}
              </div>
            </div>
          )}

          {/* Navigation - Light */}
          <nav style={{ flex: 1 }}>
            <div style={{ marginBottom: '24px' }}>
              {sidebarOpen && (
                <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: '12px', paddingLeft: '12px' }}>
                  MAIN MENU
                </p>
              )}
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: isActive ? '#4f46e5' : '#475569',
                      background: isActive ? '#e0e7ff' : 'transparent',
                      marginBottom: '4px',
                      fontSize: '14px',
                      fontWeight: isActive ? '500' : '400',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#1e293b';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#475569';
                      }
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Logout Button - Light */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              width: '100%',
              border: '1px solid #fee2e2',
              background: '#fef2f2',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              marginTop: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#fee2e2';
            }}
          >
            <span style={{ fontSize: '20px' }}>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: sidebarOpen ? '280px' : '80px',
          flex: 1,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {/* Top Navigation Bar */}
        <div
          style={{
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              {user?.role === 'student' && 'Student Dashboard'}
              {user?.role === 'instructor' && 'Instructor Dashboard'}
              {user?.role === 'admin' && 'Admin Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📅</span>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <button
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              <span>🔔</span>
              <span style={{ fontSize: '12px' }}>Notifications</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '32px' }}>{children}</div>
      </main>
    </div>
  );
}