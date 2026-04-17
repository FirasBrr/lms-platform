'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Lesson {
  title: string;
  description: string;
  type: string;
  content: string;
  duration: number;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  level: string;
  status: string;
  whatYouWillLearn: string[];
  requirements: string[];
  lessons: Lesson[];
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [currentLesson, setCurrentLesson] = useState<Lesson>({
    title: '',
    description: '',
    type: 'video',
    content: '',
    duration: 0,
    order: 0
  });

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
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses?id=${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setCourse(data.course);
        setLessons(data.course.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const updateCourse = async (updates: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses?id=${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating course:', error);
      return false;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        await updateCourse({ thumbnail: data.url });
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

  const addLesson = async () => {
    if (!currentLesson.title) {
      alert('Please enter lesson title');
      return;
    }
    const newLesson = { ...currentLesson, order: lessons.length };
    const newLessons = [...lessons, newLesson];
    setLessons(newLessons);
    setCurrentLesson({ title: '', description: '', type: 'video', content: '', duration: 0, order: 0 });
    setShowLessonForm(false);
    await updateCourse({ lessons: newLessons });
    alert('Lesson added successfully!');
  };

  const removeLesson = async (index: number) => {
    if (!confirm('Remove this lesson?')) return;
    const newLessons = lessons.filter((_, i) => i !== index);
    setLessons(newLessons);
    await updateCourse({ lessons: newLessons });
    alert('Lesson removed successfully!');
  };

  const publishCourse = async () => {
    const success = await updateCourse({ status: 'pending' });
    if (success) {
      alert('Course submitted for review!');
      router.push('/instructor/courses');
    }
  };

  const handleArrayInput = (
    index: number,
    value: string,
    field: 'whatYouWillLearn' | 'requirements'
  ) => {
    if (!course) return;
    const newArray = [...(course[field] || [])];
    newArray[index] = value;
    updateCourse({ [field]: newArray });
  };

  const addArrayField = (field: 'whatYouWillLearn' | 'requirements') => {
    if (!course) return;
    const currentArray = course[field] || [];
    updateCourse({ [field]: [...currentArray, ''] });
  };

  const removeArrayField = (index: number, field: 'whatYouWillLearn' | 'requirements') => {
    if (!course) return;
    const newArray = (course[field] || []).filter((_, i) => i !== index);
    updateCourse({ [field]: newArray });
  };

  if (!course) return (
    <DashboardLayout user={user}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </DashboardLayout>
  );

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'learn', label: 'What You\'ll Learn', icon: '🎯' },
    { id: 'requirements', label: 'Requirements', icon: '📋' },
    { id: 'lessons', label: 'Lessons', icon: '📚' }
  ];

  const getStatusInfo = () => {
    switch (course.status) {
      case 'published':
        return { bg: '#d1fae5', color: '#065f46', text: 'Published', icon: '✅' };
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', text: 'Pending Review', icon: '⏳' };
      case 'draft':
        return { bg: '#f3f4f6', color: '#6b7280', text: 'Draft', icon: '📝' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', text: 'Draft', icon: '📝' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <DashboardLayout user={user}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                Edit Course
              </h1>
              <p style={{ color: '#64748b', fontSize: '15px' }}>
                Manage your course content and settings
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ 
                padding: '6px 14px', 
                borderRadius: '20px', 
                fontSize: '13px',
                background: statusInfo.bg,
                color: statusInfo.color,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {statusInfo.icon} {statusInfo.text}
              </span>
              {course.status !== 'published' && (
                <button
                  onClick={publishCourse}
                  style={{ 
                    padding: '8px 20px', 
                    background: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📤</span> Submit for Review
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '32px',
          padding: '8px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap'
        }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
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
                Edit your course details
              </p>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                  Course Title
                </label>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) => updateCourse({ title: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '10px', 
                    fontSize: '15px'
                  }}
                />
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
                  {course.thumbnail ? (
                    <div>
                      <img 
                        src={course.thumbnail} 
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
                          onClick={() => updateCourse({ thumbnail: '' })}
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
                  Description
                </label>
                <textarea
                  value={course.description}
                  onChange={(e) => updateCourse({ description: e.target.value })}
                  rows={6}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '10px', 
                    fontSize: '15px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                    Category
                  </label>
                  <select
                    value={course.category}
                    onChange={(e) => updateCourse({ category: e.target.value })}
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
                    Level
                  </label>
                  <select
                    value={course.level}
                    onChange={(e) => updateCourse({ level: e.target.value })}
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
                Update the learning outcomes
              </p>
            </div>
            
            <div style={{ padding: '24px' }}>
              {(course.whatYouWillLearn || []).map((item, index) => (
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
                Update the course requirements
              </p>
            </div>
            
            <div style={{ padding: '24px' }}>
              {(course.requirements || []).map((req, index) => (
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

        {/* Lessons Section */}
        {activeSection === 'lessons' && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                    Course Lessons
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                    Manage your course content
                  </p>
                </div>
                <button
                  onClick={() => setShowLessonForm(!showLessonForm)}
                  style={{ 
                    padding: '8px 20px', 
                    background: '#4f46e5', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>+</span> Add Lesson
                </button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {showLessonForm && (
                <div style={{ 
                  background: '#f8fafc', 
                  borderRadius: '12px', 
                  padding: '20px', 
                  marginBottom: '24px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b' }}>
                    New Lesson
                  </h3>
                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type="text"
                      placeholder="Lesson Title"
                      value={currentLesson.title}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '10px 14px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        fontSize: '14px' 
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <textarea
                      placeholder="Lesson Description"
                      value={currentLesson.description}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, description: e.target.value })}
                      rows={3}
                      style={{ 
                        width: '100%', 
                        padding: '10px 14px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <select
                      value={currentLesson.type}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, type: e.target.value })}
                      style={{ 
                        padding: '10px 14px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        background: 'white'
                      }}
                    >
                      <option value="video">🎥 Video</option>
                      <option value="text">📝 Text</option>
                      <option value="pdf">📄 PDF</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={currentLesson.duration}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, duration: parseInt(e.target.value) })}
                      style={{ 
                        padding: '10px 14px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        fontSize: '14px' 
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <input
                      type="text"
                      placeholder={currentLesson.type === 'video' ? 'YouTube URL' : 'Content URL or Text'}
                      value={currentLesson.content}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '10px 14px', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        fontSize: '14px' 
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setShowLessonForm(false)}
                      style={{ 
                        padding: '8px 20px', 
                        background: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addLesson}
                      style={{ 
                        padding: '8px 20px', 
                        background: '#4f46e5', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Add Lesson
                    </button>
                  </div>
                </div>
              )}

              {lessons.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px', 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  border: '1px dashed #e2e8f0'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                    No lessons yet
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: '20px' }}>
                    Click "Add Lesson" to start building your course content
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {lessons.map((lesson, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '16px 20px', 
                        background: '#f8fafc', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ 
                            width: '28px', 
                            height: '28px', 
                            background: '#e0e7ff', 
                            borderRadius: '6px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#4f46e5',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{lesson.title}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', marginLeft: '40px' }}>
                          {lesson.duration} min • {lesson.type === 'video' ? '🎥 Video' : lesson.type === 'pdf' ? '📄 PDF' : '📝 Text'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeLesson(idx)}
                        style={{ 
                          padding: '6px 16px', 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => router.push('/instructor/courses')}
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
            ← Back to Courses
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {activeSection !== 'basic' && (
              <button
                type="button"
                onClick={() => {
                  const sectionsList = ['basic', 'learn', 'requirements', 'lessons'];
                  const currentIndex = sectionsList.indexOf(activeSection);
                  setActiveSection(sectionsList[currentIndex - 1]);
                }}
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
            
            {activeSection !== 'lessons' ? (
              <button
                type="button"
                onClick={() => {
                  const sectionsList = ['basic', 'learn', 'requirements', 'lessons'];
                  const currentIndex = sectionsList.indexOf(activeSection);
                  setActiveSection(sectionsList[currentIndex + 1]);
                }}
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
                type="button"
                onClick={() => router.push('/instructor/courses')}
                style={{ 
                  padding: '12px 32px', 
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontWeight: '500'
                }}
              >
                Done ✨
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}