import { Schema, model, models } from 'mongoose';

const CertificateSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  courseTitle: { 
    type: String, 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  certificateId: { 
    type: String, 
    required: true,
    unique: true 
  },
  issueDate: { 
    type: Date, 
    default: Date.now 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default models.Certificate || model('Certificate', CertificateSchema);