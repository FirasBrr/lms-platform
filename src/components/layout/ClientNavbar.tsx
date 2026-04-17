'use client';

import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('./NavbarContent'), {
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