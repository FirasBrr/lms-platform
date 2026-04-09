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
      
      // Clean up data - remove empty strings from arrays
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

  return (
    <DashboardLayout user={user}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Create New Course
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          Fill in the details below to create your course
        </p>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Basic Information</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Course Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                placeholder="e.g., Complete Web Development Bootcamp"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Thumbnail Image</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ flex: 1, padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                {uploading && <span>Uploading...</span>}
              </div>
              {formData.thumbnail && (
                <div style={{ marginTop: '12px' }}>
                  <img 
                    src={formData.thumbnail} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '200px', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, thumbnail: '' })}
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                placeholder="What will students learn in this course?"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Level *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
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
            {formData.whatYouWillLearn.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayInput(index, e.target.value, 'whatYouWillLearn')}
                  style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  placeholder="e.g., Build full-stack web applications"
                />
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'whatYouWillLearn')}
                  style={{ padding: '0 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('whatYouWillLearn')}
              style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              + Add Learning Point
            </button>
          </div>

          {/* Requirements */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Requirements</h2>
            {formData.requirements.map((req, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayInput(index, e.target.value, 'requirements')}
                  style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  placeholder="e.g., Basic computer knowledge"
                />
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'requirements')}
                  style={{ padding: '0 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField('requirements')}
              style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              + Add Requirement
            </button>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ padding: '12px 24px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              style={{ padding: '12px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: (loading || uploading) ? 0.7 : 1 }}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}