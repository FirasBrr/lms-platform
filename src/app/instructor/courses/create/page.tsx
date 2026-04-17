'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: 'Programming',
    level: 'Beginner',
    whatYouWillLearn: [''],
    requirements: ['']
  });
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'instructor' && userData.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    setUser(userData);
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await res.json();

      if (res.ok) {
        setFormData(prev => ({ ...prev, thumbnail: data.url }));
        alert('Image uploaded successfully!');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const cleanData = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail,
        category: formData.category,
        level: formData.level,
        whatYouWillLearn: formData.whatYouWillLearn.filter(item => item && item.trim() !== ''),
        requirements: formData.requirements.filter(item => item && item.trim() !== '')
      };
      
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanData)
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/instructor/courses/${data.course._id}/edit`);
      } else {
        alert(data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const sections = ['basic', 'learn', 'requirements'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1]);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    const sections = ['basic', 'learn', 'requirements'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1]);
    }
  };

  const handleArrayInput = (
    index: number,
    value: string,
    field: 'whatYouWillLearn' | 'requirements'
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'whatYouWillLearn' | 'requirements') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (index: number, field: 'whatYouWillLearn' | 'requirements') => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  if (!user) return null;

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'learn', label: 'What You\'ll Learn', icon: '🎯' },
    { id: 'requirements', label: 'Requirements', icon: '📋' }
  ];

  return (
    <DashboardLayout user={user}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            Create New Course
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Fill in the details below. After creating, you'll be able to add lessons.
          </p>
        </div>

        {/* Progress Steps - Moved OUTSIDE the form */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '32px',
          padding: '8px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection(section.id);
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: activeSection === section.id ? '#4f46e5' : 'transparent',
                color: activeSection === section.id ? 'white' : '#475569',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          {activeSection === 'basic' && (
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                  Basic Information
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  Enter the fundamental details about your course
                </p>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                    Course Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '10px', 
                      fontSize: '15px',
                      transition: 'all 0.2s'
                    }}
                    placeholder="e.g., Complete Web Development Bootcamp 2024"
                    onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  />
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    A clear, descriptive title that attracts students
                  </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                    Thumbnail Image
                  </label>
                  <div style={{ 
                    border: '2px dashed #e2e8f0', 
                    borderRadius: '12px', 
                    padding: '20px',
                    textAlign: 'center',
                    background: '#f8fafc'
                  }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="thumbnail-upload"
                    />
                    {formData.thumbnail ? (
                      <div>
                        <img 
                          src={formData.thumbnail} 
                          alt="Preview" 
                          style={{ 
                            maxWidth: '200px', 
                            borderRadius: '12px',
                            marginBottom: '12px'
                          }}
                        />
                        <div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, thumbnail: '' })}
                            style={{ 
                              padding: '6px 16px', 
                              background: '#ef4444', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '8px', 
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            padding: '10px 20px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          {uploading ? 'Uploading...' : 'Upload Thumbnail'}
                        </button>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                          Recommended size: 1280x720px. Max 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                    Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '10px', 
                      fontSize: '15px',
                      resize: 'vertical'
                    }}
                    placeholder="What will students learn in this course? Describe the key topics and outcomes..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                      Category <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        fontSize: '15px',
                        background: 'white'
                      }}
                    >
                      <option value="Programming">💻 Programming</option>
                      <option value="Design">🎨 Design</option>
                      <option value="Business">💼 Business</option>
                      <option value="Marketing">📢 Marketing</option>
                      <option value="Data Science">📊 Data Science</option>
                      <option value="AI/ML">🤖 AI/ML</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                      Level <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        fontSize: '15px',
                        background: 'white'
                      }}
                    >
                      <option value="Beginner">🌱 Beginner</option>
                      <option value="Intermediate">📈 Intermediate</option>
                      <option value="Advanced">🚀 Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What You'll Learn Section */}
          {activeSection === 'learn' && (
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                  What You'll Learn
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  List the key outcomes students will achieve
                </p>
              </div>
              
              <div style={{ padding: '24px' }}>
                {formData.whatYouWillLearn.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: '#e0e7ff', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#4f46e5',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayInput(index, e.target.value, 'whatYouWillLearn')}
                      style={{ 
                        flex: 1, 
                        padding: '10px 14px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        fontSize: '14px' 
                      }}
                      placeholder="e.g., Build full-stack web applications"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'whatYouWillLearn')}
                      style={{ 
                        padding: '0 16px', 
                        background: '#fee2e2', 
                        color: '#dc2626', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('whatYouWillLearn')}
                  style={{ 
                    padding: '10px 20px', 
                    background: '#f1f5f9', 
                    color: '#475569', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>+</span> Add Learning Point
                </button>
              </div>
            </div>
          )}

          {/* Requirements Section */}
          {activeSection === 'requirements' && (
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                  Requirements / Prerequisites
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  What students need to know before taking this course
                </p>
              </div>
              
              <div style={{ padding: '24px' }}>
                {formData.requirements.map((req, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: '#fef3c7', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#d97706',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayInput(index, e.target.value, 'requirements')}
                      style={{ 
                        flex: 1, 
                        padding: '10px 14px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        fontSize: '14px' 
                      }}
                      placeholder="e.g., Basic computer knowledge"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'requirements')}
                      style={{ 
                        padding: '0 16px', 
                        background: '#fee2e2', 
                        color: '#dc2626', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('requirements')}
                  style={{ 
                    padding: '10px 20px', 
                    background: '#f1f5f9', 
                    color: '#475569', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>+</span> Add Requirement
                </button>
              </div>
            </div>
          )}

          {/* Info Box - What happens next */}
          {activeSection === 'requirements' && (
            <div style={{
              background: '#e0e7ff',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>💡</span>
              <div>
                <p style={{ fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>
                  What happens next?
                </p>
                <p style={{ fontSize: '14px', color: '#4f46e5' }}>
                  After creating the course, you'll be redirected to add lessons (videos, PDFs, or text content).
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ 
                padding: '12px 24px', 
                background: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '10px', 
                cursor: 'pointer',
                fontWeight: '500',
                color: '#475569'
              }}
            >
              Cancel
            </button>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {activeSection !== 'basic' && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  style={{ 
                    padding: '12px 24px', 
                    background: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '10px', 
                    cursor: 'pointer',
                    fontWeight: '500',
                    color: '#475569'
                  }}
                >
                  ← Previous
                </button>
              )}
              
              {activeSection !== 'requirements' ? (
                <button
                  type="button"
                  onClick={handleNext}
                  style={{ 
                    padding: '12px 24px', 
                    background: '#4f46e5', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '10px', 
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || uploading}
                  style={{ 
                    padding: '12px 32px', 
                    background: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    fontWeight: '500',
                    opacity: (loading || uploading) ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? 'Creating...' : 'Create & Add Lessons →'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}