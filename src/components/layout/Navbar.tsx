'use client';

import { Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }
  if (pathname?.startsWith('/instructor')) {
    return null;
  }
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  if (pathname?.startsWith('/student')) {
    return null;
  }
  if (pathname?.startsWith('/courses')) {
    return null;
  }
  if (pathname?.startsWith('/my-courses')) {
    return null;
  }
  if (pathname?.startsWith('/certificates')) {
    return null;
  }
if (pathname?.startsWith('/profile')) {
    return null;
  }

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
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    setDropdownOpen(false);
    window.location.href = '/login';
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (!mounted) {
    return (
      <BootstrapNavbar expand="lg" fixed="top" className="navbar-custom">
        <Container>
          <span className="navbar-brand-custom">LMS Platform</span>
        </Container>
      </BootstrapNavbar>
    );
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
<Link href="/courses" className="nav-link">Courses</Link>            <Link href="/features" className="nav-link">Features</Link>
            <Link href="/about" className="nav-link">About</Link>
            
            {user ? (
              <div className="position-relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="btn btn-link nav-link dropdown-toggle d-flex align-items-center gap-2"
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                  type="button"
                >
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span>{user.name?.split(' ')[0] || 'User'}</span>
                </button>
                
                {dropdownOpen && (
                  <div className="position-absolute end-0 mt-2" style={{ 
                    background: 'white', 
                    borderRadius: '8px', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                    zIndex: 1000,
                    border: '1px solid #e5e7eb'
                  }}>
                    <div className="py-2">
                      <div className="px-4 py-2 border-bottom">
                        <div className="fw-semibold">{user.name}</div>
                        <div className="small text-muted">{user.email}</div>
                      </div>
                      <Link 
                        href={`/dashboard/${user.role}`} 
                        className="dropdown-item px-4 py-2 d-block"
                        style={{ textDecoration: 'none', color: '#374151' }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-speedometer2 me-2"></i> Dashboard
                      </Link>
                      <Link 
                        href="/profile" 
                        className="dropdown-item px-4 py-2 d-block"
                        style={{ textDecoration: 'none', color: '#374151' }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <i className="bi bi-person me-2"></i> Profile
                      </Link>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="dropdown-item px-4 py-2 w-100 text-start"
                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </div>
                  </div>
                )}
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