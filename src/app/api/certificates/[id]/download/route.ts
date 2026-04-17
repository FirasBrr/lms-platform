import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    
    const certificate = await Certificate.findById(id)
      .populate('userId', 'name email')
      .populate('courseId', 'title description');
    
    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }
    
    // Verify ownership
    if (certificate.userId._id.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Increment download count
    certificate.downloadCount += 1;
    await certificate.save();
    
    // Generate HTML certificate
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate of Completion</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          .certificate {
            width: 900px;
            background: white;
            padding: 60px 40px;
            border: 15px solid #4f46e5;
            position: relative;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .certificate::before {
            content: '🎓';
            font-size: 60px;
            position: absolute;
            top: 20px;
            right: 30px;
            opacity: 0.3;
          }
          .certificate::after {
            content: '🎓';
            font-size: 60px;
            position: absolute;
            bottom: 20px;
            left: 30px;
            opacity: 0.3;
            transform: rotate(180deg);
          }
          .title {
            font-size: 48px;
            color: #4f46e5;
            margin-bottom: 20px;
            letter-spacing: 2px;
          }
          .subtitle {
            font-size: 20px;
            color: #666;
            margin-bottom: 40px;
            border-bottom: 2px solid #e5e7eb;
            display: inline-block;
            padding-bottom: 8px;
          }
          .recipient-name {
            font-size: 48px;
            font-weight: bold;
            color: #1e293b;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
          }
          .course-name {
            font-size: 28px;
            color: #4f46e5;
            font-weight: bold;
            margin: 20px 0;
          }
          .description {
            font-size: 16px;
            color: #666;
            margin: 20px 0;
            line-height: 1.6;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          .date {
            margin-top: 40px;
            font-size: 16px;
            color: #666;
          }
          .certificate-id {
            margin-top: 30px;
            font-size: 12px;
            color: #999;
            font-family: monospace;
          }
          .signature {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            display: inline-block;
            width: 300px;
          }
          .signature-line {
            font-style: italic;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="title">CERTIFICATE OF COMPLETION</div>
          <div class="subtitle">This certificate is proudly presented to</div>
          <div class="recipient-name">${certificate.userId.name}</div>
          <div class="subtitle">for successfully completing</div>
          <div class="course-name">${certificate.courseTitle}</div>
          <div class="description">
            This certificate recognizes the outstanding achievement and dedication 
            to mastering the skills and knowledge presented in this course.
          </div>
          <div class="date">
            Issued on: ${new Date(certificate.issueDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div class="signature">
            <div>_____________________</div>
            <div class="signature-line">LMS Platform Director</div>
          </div>
          <div class="certificate-id">Certificate ID: ${certificate.certificateId}</div>
        </div>
      </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="certificate-${certificate.certificateId}.html"`
      }
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return NextResponse.json({ error: 'Failed to download certificate' }, { status: 500 });
  }
}