'use client';

import { Container, Nav, Navbar as BootstrapNavbar, Button } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter }from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavigationBar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <BootstrapNavbar expand="lg" fixed="top" className={`navbar-custom ${scrolled ? 'shadow-sm' : ''}`}>
      <Container>
        <Link href="/" className="navbar-brand-custom">
          LMS Platform
        </Link>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            <Link href="/courses" className="nav-link">Courses</Link>
            <Link href="/features" className="nav-link">Features</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About</Link>
            
            {user ? (
              <div className="dropdown">
                <button className="btn btn-link nav-link dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span>{user.name?.split(' ')[0] || 'User'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link href={`/dashboard/${user.role}`} className="dropdown-item">Dashboard</Link></li>
                  <li><Link href="/profile" className="dropdown-item">Profile</Link></li>
                  <li><Link href="/settings" className="dropdown-item">Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button onClick={handleLogout} className="dropdown-item text-danger">Logout</button></li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link href="/login" className="btn btn-outline-primary rounded-pill px-4">Sign In</Link>
                <Link href="/register" className="btn btn-primary rounded-pill px-4">Start Free</Link>
              </div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}