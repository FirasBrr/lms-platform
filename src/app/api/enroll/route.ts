import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
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

// GET - Get user's enrolled courses
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
    
    await connectDB();
    
    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    
    return NextResponse.json({ 
      enrolledCourses: user?.enrolledCourses || [] 
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json({ error: 'Failed to fetch enrolled courses' }, { status: 500 });
  }
}

// POST - Enroll in a course
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Please login to enroll' }, { status: 401 });
    }
    
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { courseId } = await request.json();
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Check if course is published (students can only enroll in published courses)
    if (course.status !== 'published') {
      return NextResponse.json({ error: 'Course is not available for enrollment yet' }, { status: 400 });
    }
    
    // Check if already enrolled
    if (course.enrolledStudents.includes(userId)) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }
    
    // Add student to course
    course.enrolledStudents.push(userId);
    await course.save();
    
    // Add course to user's enrolled list
    await User.findByIdAndUpdate(userId, {
      $push: {
        enrolledCourses: {
          courseId: courseId,
          enrolledAt: new Date(),
          progress: 0
        }
      }
    });
    
    return NextResponse.json({
      message: 'Successfully enrolled in course',
      course: {
        _id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
  }
}

// DELETE - Unenroll from a course
export async function DELETE(request: NextRequest) {
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
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Remove student from course
    await Course.findByIdAndUpdate(courseId, {
      $pull: { enrolledStudents: userId }
    });
    
    // Remove course from user's enrolled list
    await User.findByIdAndUpdate(userId, {
      $pull: { enrolledCourses: { courseId: courseId } }
    });
    
    return NextResponse.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Unenroll error:', error);
    return NextResponse.json({ error: 'Failed to unenroll from course' }, { status: 500 });
  }
}