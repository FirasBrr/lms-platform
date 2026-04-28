'use client';

import { useEffect, useState } from 'react';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: string;
}

interface CourseReviewsProps {
  courseId: string;
  user: any;
}

export default function CourseReviews({ courseId, user }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
        setRatingDistribution(data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        
        // Check if user already reviewed
        if (user) {
          const userReview = data.reviews?.find((r: Review) => r.userName === user.name);
          if (userReview) {
            setUserRating(userReview.rating);
            setUserComment(userReview.comment);
            setIsEditing(true);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Please login to leave a review');
      return;
    }

    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!userComment.trim()) {
      alert('Please write a comment');
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: userRating,
          comment: userComment
        })
      });

      if (res.ok) {
        alert(isEditing ? 'Review updated!' : 'Review added!');
        fetchReviews();
        if (!isEditing) {
          setUserRating(0);
          setUserComment('');
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Review deleted');
        setUserRating(0);
        setUserComment('');
        setIsEditing(false);
        fetchReviews();
      } else {
        alert('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Something went wrong');
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (r: number) => void) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange?.(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: interactive ? 'pointer' : 'default',
              fontSize: '20px',
              color: (interactive ? (hoveredRating >= star || userRating >= star) : rating >= star) ? '#f59e0b' : '#e2e8f0',
              padding: 0
            }}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading reviews...</div>;
  }

  return (
    <div style={{ marginTop: '48px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Student Reviews
        {totalReviews > 0 && (
          <span style={{ fontSize: '16px', color: '#64748b', marginLeft: '12px' }}>
            ({averageRating.toFixed(1)} ★ • {totalReviews} reviews)
          </span>
        )}
      </h2>

      {/* Rating Summary */}
      {totalReviews > 0 && (
        <div style={{ 
          background: '#f8fafc', 
          borderRadius: '12px', 
          padding: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e293b' }}>
                {averageRating.toFixed(1)}
              </div>
              <div>{renderStars(Math.round(averageRating))}</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Based on {totalReviews} reviews</div>
            </div>
            <div style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star as keyof typeof ratingDistribution] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ width: '30px', fontSize: '14px' }}>{star} ★</span>
                    <div style={{ flex: 1, background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: '#f59e0b' }} />
                    </div>
                    <span style={{ width: '40px', fontSize: '13px', color: '#64748b' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Section - Show review form (user is enrolled because component only renders when enrolled) */}
      {user && (
        <div style={{ 
          background: 'white', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Rating</label>
            {renderStars(userRating, true, setUserRating)}
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Comment</label>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this course..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                resize: 'vertical'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              style={{
                padding: '10px 24px',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review')}
            </button>
            {isEditing && (
              <button
                onClick={handleDeleteReview}
                style={{
                  padding: '10px 24px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#dc2626'
                }}
              >
                Delete Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
          <p style={{ color: '#64748b' }}>No reviews yet. Be the first to review this course!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map((review) => (
            <div key={review._id} style={{ 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{review.userName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderStars(review.rating)}
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: '#475569', lineHeight: '1.6', marginTop: '8px' }}>{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}