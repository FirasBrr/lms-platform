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

  if (!course) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  return (
    <DashboardLayout user={user}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Edit Course: {course.title}
            </h1>
            <p style={{ color: '#6b7280' }}>Manage course details and lessons</p>
          </div>
          <button
            onClick={publishCourse}
            style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Submit for Review
          </button>
        </div>

        {/* Course Info */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Course Information</h2>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>Title</label>
            <input
              type="text"
              value={course.title}
              onChange={(e) => updateCourse({ title: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>Thumbnail Image</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ flex: 1, padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              {uploading && <span>Uploading...</span>}
            </div>
            {course.thumbnail && (
              <div style={{ marginTop: '12px' }}>
                <img 
                  src={course.thumbnail} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <button
                  type="button"
                  onClick={() => updateCourse({ thumbnail: '' })}
                  style={{ marginLeft: '12px', padding: '4px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            )}
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Upload a course thumbnail (JPG, PNG, WEBP - max 5MB)
            </p>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>Description</label>
            <textarea
              value={course.description}
              onChange={(e) => updateCourse({ description: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>Category</label>
              <select
                value={course.category}
                onChange={(e) => updateCourse({ category: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              >
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Data Science">Data Science</option>
                <option value="AI/ML">AI/ML</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: '500', display: 'block', marginBottom: '4px' }}>Level</label>
              <select
                value={course.level}
                onChange={(e) => updateCourse({ level: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>What You'll Learn</h2>
          {(course.whatYouWillLearn || []).map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayInput(index, e.target.value, 'whatYouWillLearn')}
                style={{ flex: 1, padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                placeholder="e.g., Build full-stack web applications"
              />
              <button
                type="button"
                onClick={() => removeArrayField(index, 'whatYouWillLearn')}
                style={{ padding: '0 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('whatYouWillLearn')}
            style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            + Add Learning Point
          </button>
        </div>

        {/* Requirements */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Requirements</h2>
          {(course.requirements || []).map((req, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={req}
                onChange={(e) => handleArrayInput(index, e.target.value, 'requirements')}
                style={{ flex: 1, padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                placeholder="e.g., Basic computer knowledge"
              />
              <button
                type="button"
                onClick={() => removeArrayField(index, 'requirements')}
                style={{ padding: '0 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('requirements')}
            style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            + Add Requirement
          </button>
        </div>

        {/* Lessons Section */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Lessons ({lessons.length})</h2>
            <button
              onClick={() => setShowLessonForm(!showLessonForm)}
              style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              + Add Lesson
            </button>
          </div>

          {showLessonForm && (
            <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>New Lesson</h3>
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Lesson Title"
                  value={currentLesson.title}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <textarea
                  placeholder="Lesson Description"
                  value={currentLesson.description}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <select
                  value={currentLesson.type}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, type: e.target.value })}
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                >
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                  <option value="pdf">PDF</option>
                </select>
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={currentLesson.duration}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, duration: parseInt(e.target.value) })}
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder={currentLesson.type === 'video' ? 'YouTube URL' : 'Content URL or Text'}
                  value={currentLesson.content}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowLessonForm(false)}
                  style={{ padding: '6px 12px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={addLesson}
                  style={{ padding: '6px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Add Lesson
                </button>
              </div>
            </div>
          )}

          {lessons.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No lessons yet. Click "Add Lesson" to get started.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lessons.map((lesson, idx) => (
                <div key={idx} style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{idx + 1}. {lesson.title}</span>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {lesson.duration} min • {lesson.type} • {lesson.type === 'video' ? '🎥 Video' : lesson.type === 'pdf' ? '📄 PDF' : '📝 Text'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeLesson(idx)}
                    style={{ padding: '4px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div style={{ background: 'white', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: '500' }}>Course Status: </span>
            <span style={{ 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px',
              background: course.status === 'published' ? '#d1fae5' : course.status === 'pending' ? '#fef3c7' : '#f3f4f6',
              color: course.status === 'published' ? '#065f46' : course.status === 'pending' ? '#92400e' : '#6b7280'
            }}>
              {course.status === 'published' ? 'Published' : course.status === 'pending' ? 'Pending Review' : 'Draft'}
            </span>
          </div>
          <button
            onClick={() => router.push('/instructor/courses')}
            style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Back to My Courses
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}