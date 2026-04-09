import { Schema, model, models } from 'mongoose';

const LessonSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  type: { 
    type: String, 
    enum: ['video', 'pdf', 'text'], 
    default: 'video' 
  },
  content: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    default: 0 
  },
  order: { 
    type: Number, 
    default: 0 
  }
});

const CourseSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  thumbnail: { 
    type: String, 
    default: '' 
  },  // ADD THIS FIELD
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
  instructor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  lessons: [LessonSchema],
  whatYouWillLearn: [String],
  requirements: [String],
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