import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }
    
    await connectDB();
    
    const user = await User.findById(userId);
    const enrolledCourse = user?.enrolledCourses?.find(
      (c: any) => c.courseId.toString() === courseId
    );
    
    return NextResponse.json({ 
      progress: enrolledCourse?.progress || 0,
      completedLessons: enrolledCourse?.completedLessons || []
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { courseId, lessonId, completed } = await request.json();
    
    if (!courseId || !lessonId) {
      return NextResponse.json({ error: 'Course ID and Lesson ID required' }, { status: 400 });
    }
    
    await connectDB();
    
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Find or create enrolled course entry
    let enrolledCourseIndex = user.enrolledCourses?.findIndex(
      (c: any) => c.courseId.toString() === courseId
    );
    
    if (enrolledCourseIndex === -1 || enrolledCourseIndex === undefined) {
      // If not enrolled, add enrollment first
      user.enrolledCourses.push({
        courseId: courseId,
        enrolledAt: new Date(),
        progress: 0,
        completedLessons: []
      });
      enrolledCourseIndex = user.enrolledCourses.length - 1;
    }
    
    let completedLessons = user.enrolledCourses[enrolledCourseIndex].completedLessons || [];
    
    if (completed) {
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }
    } else {
      completedLessons = completedLessons.filter((id: string) => id !== lessonId);
    }
    
    const totalLessons = course.lessons?.length || 1;
    const progress = Math.round((completedLessons.length / totalLessons) * 100);
    
    user.enrolledCourses[enrolledCourseIndex].completedLessons = completedLessons;
    user.enrolledCourses[enrolledCourseIndex].progress = progress;
    await user.save();
    
    return NextResponse.json({ 
      success: true, 
      progress, 
      completedLessons,
      message: completed ? 'Lesson marked as complete' : 'Lesson marked as incomplete'
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}