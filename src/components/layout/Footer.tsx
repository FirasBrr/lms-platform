'use client';

import { Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // DON'T show footer on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="footer">
      <Container>
        <Row className="g-4">
          <Col lg={4}>
            <h5 className="fw-bold">LMS Platform</h5>
            <p className="text-muted">Transform your career with AI-powered learning.</p>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-muted"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="text-muted"><i className="bi bi-github"></i></a>
            </div>
          </Col>
          
          <Col lg={2}>
            <h6 className="fw-bold">Product</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link href="/courses" className="text-muted">Courses</Link></li>
              <li className="mb-2"><Link href="/features" className="text-muted">Features</Link></li>
              <li className="mb-2"><Link href="/pricing" className="text-muted">Pricing</Link></li>
            </ul>
          </Col>
          
          <Col lg={2}>
            <h6 className="fw-bold">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link href="/about" className="text-muted">About</Link></li>
              <li className="mb-2"><Link href="/blog" className="text-muted">Blog</Link></li>
              <li className="mb-2"><Link href="/careers" className="text-muted">Careers</Link></li>
            </ul>
          </Col>
          
          <Col lg={4}>
            <h6 className="fw-bold">Newsletter</h6>
            <p className="text-muted">Get the latest updates on new courses.</p>
            <div className="input-group">
              <input type="email" className="form-control" placeholder="Your email" />
              <button className="btn btn-primary" type="button">Subscribe</button>
            </div>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <div className="text-center text-muted">
          <small>&copy; 2026 LMS Platform. All rights reserved.</small>
        </div>
      </Container>
    </footer>
  );
}