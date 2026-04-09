import { Schema, model, models } from 'mongoose';

const LessonSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  type: { 
    type: String, 
    enum: ['video', 'pdf', 'text'], 
    default: 'video' 
  },
  content: { 
    type: String, 
    required: true 
  }, // YouTube URL, PDF link, or text content
  duration: Number, // in minutes
  order: { 
    type: Number, 
    default: 0 
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  }
});

const CourseSchema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Course title is required'],
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'AI/ML', 'Other']
  },
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  thumbnail: { 
    type: String, 
    default: '' 
  },
  instructor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  lessons: [LessonSchema],
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'published', 'rejected'], 
    default: 'draft' 
  },
  enrolledStudents: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  rating: { 
    type: Number, 
    default: 0 
  },
  totalRatings: { 
    type: Number, 
    default: 0 
  },
  tags: [String],
  requirements: [String],
  whatYouWillLearn: [String],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default models.Course || model('Course', CourseSchema);