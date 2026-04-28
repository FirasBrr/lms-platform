import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';

// GET - Get all reviews for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const reviews = await Review.find({ courseId: id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Get average rating
    const stats = await Review.aggregate([
      { $match: { courseId: id } },
      { $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingCounts: {
          $push: '$rating'
        }
      } }
    ]);
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats[0]?.ratingCounts) {
      stats[0].ratingCounts.forEach((r: number) => {
        ratingDistribution[r as keyof typeof ratingDistribution]++;
      });
    }
    
    return NextResponse.json({
      reviews,
      averageRating: stats[0]?.averageRating || 0,
      totalReviews: stats[0]?.totalReviews || 0,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST - Add a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const { rating, comment } = await request.json();
    
    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    
    await connectDB();
    
    // Check if user already reviewed this course
    const existingReview = await Review.findOne({
      courseId: id,
      userId: payload.userId
    });
    
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this course' }, { status: 400 });
    }
    
    // Create review
    const review = await Review.create({
      courseId: id,
      userId: payload.userId,
      userName: payload.name,
      rating,
      comment
    });
    
    // Update course rating stats
    const allReviews = await Review.find({ courseId: id });
    const totalRatings = allReviews.length;
    const averageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings;
    
    await Course.findByIdAndUpdate(id, {
      rating: averageRating,
      totalRatings: totalRatings
    });
    
    return NextResponse.json({ 
      review,
      message: 'Review added successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}

// PUT - Update a review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const { rating, comment } = await request.json();
    
    await connectDB();
    
    const review = await Review.findOne({
      courseId: id,
      userId: payload.userId
    });
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    review.rating = rating;
    review.comment = comment;
    review.updatedAt = new Date();
    await review.save();
    
    // Update course rating stats
    const allReviews = await Review.find({ courseId: id });
    const totalRatings = allReviews.length;
    const averageRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings;
    
    await Course.findByIdAndUpdate(id, {
      rating: averageRating,
      totalRatings: totalRatings
    });
    
    return NextResponse.json({ 
      review,
      message: 'Review updated successfully' 
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// DELETE - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    await connectDB();
    
    const review = await Review.findOneAndDelete({
      courseId: id,
      userId: payload.userId
    });
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    // Update course rating stats
    const allReviews = await Review.find({ courseId: id });
    const totalRatings = allReviews.length;
    const averageRating = totalRatings > 0 
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings
      : 0;
    
    await Course.findByIdAndUpdate(id, {
      rating: averageRating,
      totalRatings: totalRatings
    });
    
    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}