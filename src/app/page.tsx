'use client';

import { Container, Row, Col, Button } from 'react-bootstrap';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const features = [
  { icon: '🎯', title: 'Personalized Learning', desc: 'AI-powered course recommendations tailored to your goals' },
  { icon: '👨‍🏫', title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience' },
  { icon: '📜', title: 'Verified Certificates', desc: 'Earn recognized certificates to showcase your skills' },
  { icon: '💬', title: '24/7 AI Tutor', desc: 'Get instant help with our intelligent AI assistant' },
  { icon: '🌍', title: 'Global Community', desc: 'Connect with 50,000+ learners worldwide' },
  { icon: '📱', title: 'Learn Anywhere', desc: 'Access courses on desktop, tablet, or mobile' },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <h1 className="display-3 fw-bold mb-4">
                Transform Your Career with{' '}
                <span style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  AI-Powered Learning
                </span>
              </h1>
              <p className="lead text-muted mb-4">
                Join 50,000+ students mastering new skills with our intelligent platform. Get personalized recommendations and 24/7 AI tutor support.
              </p>
              <div className="d-flex gap-3 mb-5">
                <Link href={user ? '/courses' : '/register'} className="btn btn-primary-custom">
                  {user ? 'Browse Courses' : 'Start Learning Free'}
                </Link>
                <Link href="/courses" className="btn btn-outline-custom">
                  Explore Courses
                </Link>
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="card-modern p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="feature-icon" style={{ width: '48px', height: '48px' }}>
                    <i className="bi bi-play-circle fs-4"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">Getting Started with AI</h5>
                    <p className="text-muted mb-0">Begin your learning journey today</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">Course Progress</span>
                    <span className="small fw-semibold text-primary">65%</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-primary" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span><i className="bi bi-book me-1"></i> 12 lessons</span>
                  <span><i className="bi bi-clock me-1"></i> 3.5 hours</span>
                  <span><i className="bi bi-star-fill text-warning me-1"></i> 4.8 (1.2k)</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="section section-white">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">Why Choose LMS Platform?</h2>
            <p className="lead text-muted">Everything you need to succeed in your learning journey</p>
          </div>
          
          <Row className="g-4">
            {features.map((feature, idx) => (
              <Col md={6} lg={4} key={idx}>
                <div className="feature-card">
                  <div className="feature-icon">
                    <span style={{ fontSize: '28px' }}>{feature.icon}</span>
                  </div>
                  <h4 className="h5 fw-bold mb-3">{feature.title}</h4>
                  <p className="text-muted mb-0">{feature.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: 'white' }}>
        <Container className="text-center">
          <h2 className="display-4 fw-bold mb-4">Ready to Start Learning?</h2>
          <p className="lead mb-4 opacity-90">Join our community and transform your career today</p>
          <Link href={user ? '/courses' : '/register'} className="btn btn-light rounded-pill px-5 py-3 fw-semibold">
            Get Started Free
          </Link>
        </Container>
      </section>
    </>
  );
}