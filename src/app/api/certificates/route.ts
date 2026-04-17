import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Certificate from '@/models/Certificate';
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

// GET - Get user's certificates
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
    
    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title thumbnail')
      .sort({ issueDate: -1 });
    
    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

// POST - Generate certificate for completed course
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
    
    const { courseId } = await request.json();
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Get user and course
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // Check if user is enrolled
    const enrolledCourse = user.enrolledCourses?.find(
      (c: any) => c.courseId.toString() === courseId
    );
    
    if (!enrolledCourse) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 400 });
    }
    
    // Check if course is completed (100% progress)
    if (enrolledCourse.progress < 100) {
      return NextResponse.json({ error: 'Course not completed yet' }, { status: 400 });
    }
    
    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ userId, courseId });
    if (existingCert) {
      return NextResponse.json({ 
        certificate: existingCert,
        message: 'Certificate already exists' 
      });
    }
    
    // Generate unique certificate ID
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create certificate
    const certificate = await Certificate.create({
      userId,
      courseId,
      courseTitle: course.title,
      userName: user.name,
      certificateId,
      issueDate: new Date()
    });
    
    return NextResponse.json({ 
      certificate,
      message: 'Certificate generated successfully!' 
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}