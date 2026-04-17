'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Certificate {
  _id: string;
  certificateId: string;
  courseTitle: string;
  issueDate: string;
  downloadCount: number;
  courseId: {
    _id: string;
    title: string;
    thumbnail: string;
  };
}

export default function CertificatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'student') {
      router.push(`/dashboard/${userData.role}`);
      return;
    }

    setUser(userData);
    fetchCertificates();
  }, [router]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificates');
      const data = await res.json();
      if (res.ok) {
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId: string) => {
    setDownloading(certificateId);
    try {
      window.open(`/api/certificates/${certificateId}/download`, '_blank');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            My Certificates
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            View and download your course completion certificates
          </p>
        </div>

        {certificates.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            background: 'white', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>No certificates yet</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Complete courses to earn certificates!</p>
            <Link 
              href="/courses"
              style={{ 
                padding: '10px 24px', 
                background: '#4f46e5', 
                color: 'white', 
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {certificates.map((cert) => (
              <div 
                key={cert._id} 
                style={{ 
                  background: 'white', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px'
                  }}>
                    🎓
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {cert.courseTitle}
                    </h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' }}>
                      <span>📅 Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                      <span>🆔 ID: {cert.certificateId}</span>
                      <span>📥 Downloads: {cert.downloadCount}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => downloadCertificate(cert._id)}
                    disabled={downloading === cert._id}
                    style={{
                      padding: '10px 24px',
                      background: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: downloading === cert._id ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: downloading === cert._id ? 0.7 : 1
                    }}
                  >
                    <span>📄</span>
                    {downloading === cert._id ? 'Downloading...' : 'Download Certificate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}