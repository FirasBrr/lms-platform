'use client';

import { useState, useEffect } from 'react';

interface Lesson {
  title: string;
  description: string;
  type: string;
  content: string;
  duration: number;
}

interface LessonViewerProps {
  lesson: Lesson;
  courseId: string;
  courseTitle: string;
  onClose: () => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export default function LessonViewer({ 
  lesson, 
  courseId, 
  courseTitle, 
  onClose, 
  onComplete,
  isCompleted = false 
}: LessonViewerProps) {
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);

  // Update when prop changes
  useEffect(() => {
    setCompleted(isCompleted);
  }, [isCompleted]);

  const handleMarkComplete = async () => {
    if (completed) return;
    
    setIsMarkingComplete(true);
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId,
          lessonId: lesson.title,
          completed: true
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setCompleted(true);
        if (onComplete) onComplete();
        alert('Lesson marked as complete!');
      } else {
        alert(data.error || 'Failed to mark lesson complete');
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      alert('Something went wrong');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderContent = () => {
    if (lesson.type === 'video') {
      const videoId = getYouTubeId(lesson.content);
      if (videoId) {
        return (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        );
      }
      return (
        <div style={{ textAlign: 'center', padding: '60px', background: '#f1f5f9', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎥</div>
          <p>Video URL: <a href={lesson.content} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5' }}>{lesson.content}</a></p>
          <p style={{ marginTop: '12px', color: '#64748b' }}>Click the link above to watch the video</p>
        </div>
      );
    }
    
    if (lesson.type === 'pdf') {
      return (
        <div style={{ textAlign: 'center', padding: '60px', background: '#f1f5f9', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <p>PDF Document: <a href={lesson.content} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5' }}>Open PDF →</a></p>
        </div>
      );
    }
    
    return (
      <div style={{ 
        background: '#f8fafc', 
        borderRadius: '12px', 
        padding: '32px',
        lineHeight: '1.8',
        fontSize: '16px',
        whiteSpace: 'pre-wrap'
      }}>
        {lesson.content}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{lesson.title}</h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>{courseTitle} • {lesson.duration} min</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {renderContent()}
        </div>

        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          bottom: 0,
          background: 'white'
        }}>
          <div>
            {completed && (
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✓ Lesson completed
              </span>
            )}
          </div>
          {!completed && (
            <button
              onClick={handleMarkComplete}
              disabled={isMarkingComplete}
              style={{
                padding: '10px 24px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isMarkingComplete ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: isMarkingComplete ? 0.7 : 1
              }}
            >
              {isMarkingComplete ? 'Marking...' : 'Mark as Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}