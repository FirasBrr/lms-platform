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

const courses = [
  { title: 'Complete Web Development', instructor: 'Sarah Johnson', students: '12,345', rating: 4.9, level: 'Beginner', hours: '40' },
  { title: 'Machine Learning Mastery', instructor: 'Dr. Michael Chen', students: '8,234', rating: 4.8, level: 'Advanced', hours: '35' },
  { title: 'UI/UX Design Pro', instructor: 'Emma Rodriguez', students: '6,789', rating: 4.9, level: 'Intermediate', hours: '28' },
  { title: 'Data Science Bootcamp', instructor: 'Prof. James Wilson', students: '9,876', rating: 4.9, level: 'Intermediate', hours: '45' },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

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
                <Link href="/register" className="btn btn-primary-custom">
                  Start Learning Free
                </Link>
                <Link href="/courses" className="btn btn-outline-custom">
                  Browse Courses
                </Link>
              </div>
              <div className="d-flex gap-4">
                <div>
                  <div className="stat-number" style={{ fontSize: '32px' }}>50K+</div>
                  <div className="text-muted small">Active Students</div>
                </div>
                <div>
                  <div className="stat-number" style={{ fontSize: '32px' }}>500+</div>
                  <div className="text-muted small">Expert Courses</div>
                </div>
                <div>
                  <div className="stat-number" style={{ fontSize: '32px' }}>98%</div>
                  <div className="text-muted small">Satisfaction Rate</div>
                </div>
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

      {/* Stats Section */}
      <section className="section section-gray">
        <Container>
          <Row className="g-4">
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Active Students</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-number">500+</div>
                <div className="stat-label">Expert Courses</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-number">100+</div>
                <div className="stat-label">Expert Instructors</div>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-card">
                <div className="stat-number">98%</div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Popular Courses */}
      <section className="section section-white">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">Most Popular Courses</h2>
            <p className="lead text-muted">Join thousands of students learning these top-rated courses</p>
          </div>
          
          <Row className="g-4">
            {courses.map((course, idx) => (
              <Col md={6} lg={3} key={idx}>
                <div className="course-card">
                  <div className="course-image">
                    <span className="course-badge">⭐ {course.rating}</span>
                    <span style={{ fontSize: '48px' }}>📚</span>
                  </div>
                  <div className="course-content">
                    <h5 className="course-title">{course.title}</h5>
                    <p className="course-instructor">{course.instructor}</p>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted small">👥 {course.students}</span>
                      <span className="text-muted small">⏱️ {course.hours}h</span>
                      <span className="text-muted small">{course.level}</span>
                    </div>
                    <Button variant="outline-primary" className="w-100 rounded-pill">
                      Enroll Now →
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
          
          <div className="text-center mt-5">
            <Link href="/courses" className="btn btn-primary-custom">
              Browse All Courses
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: 'white' }}>
        <Container className="text-center">
          <h2 className="display-4 fw-bold mb-4">Ready to Start Learning?</h2>
          <p className="lead mb-4 opacity-90">Join our community and transform your career today</p>
          <Link href="/register" className="btn btn-light rounded-pill px-5 py-3 fw-semibold">
            Get Started Free
          </Link>
        </Container>
      </section>
    </>
  );
}