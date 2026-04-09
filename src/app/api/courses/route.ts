import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/auth';

// Import models (this ensures they are registered)
import '@/models/User';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const id = searchParams.get('id');
    
    // If ID is provided, return single course
    if (id) {
      const course = await Course.findById(id).populate('instructor', 'name email');
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      return NextResponse.json({ course });
    }
    
    // Build query for published courses
    let query: any = { status: 'published' };
    if (category && category !== 'all') query.category = category;
    if (level && level !== 'all') query.level = level;
    if (search) query.title = { $regex: search, $options: 'i' };
    
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'instructor' && payload.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden. Only instructors can create courses.' }, { status: 403 });
    }
    
    await connectDB();
    const body = await request.json();
    
    const whatYouWillLearn = (body.whatYouWillLearn || []).filter((item: string) => item && item.trim() !== '');
    const requirements = (body.requirements || []).filter((item: string) => item && item.trim() !== '');
    
    const course = await Course.create({
      title: body.title,
      description: body.description,
      thumbnail: body.thumbnail || '',
      category: body.category,
      level: body.level,
      whatYouWillLearn: whatYouWillLearn,
      requirements: requirements,
      instructor: payload.userId,
      status: 'draft',
      lessons: []
    });
    
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course: ' + (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }
    
    await connectDB();
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    if (course.instructor.toString() !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. You can only edit your own courses.' }, { status: 403 });
    }
    
    const body = await request.json();
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...body, updatedAt: Date.now() },
      { new: true }
    );
    
    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Only admins can delete courses.' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }
    
    await connectDB();
    await Course.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}