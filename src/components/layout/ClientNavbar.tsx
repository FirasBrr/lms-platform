'use client';

import dynamic from 'next/dynamic';

// Dynamically import the navbar with SSR disabled
const Navbar = dynamic(() => import('../layout/NavbarContent'), {
  ssr: false,
  loading: () => (
    <nav className="navbar-custom">
      <div className="container">
        <span className="navbar-brand-custom">LMS Platform</span>
      </div>
    </nav>
  ),
});

export default function ClientNavbar() {
  return <Navbar />;
}