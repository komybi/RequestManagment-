import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentRequest extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  documentType: string;
  description?: string;
  quantity: number;
  department?: string;
  program?: string;
  phoneNumber?: string;
  academicYear?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentStatus: 'unpaid' | 'paid';
  amount: number;
  rejectionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  qrCode?: string;
  trackingNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentRequestSchema = new Schema<IDocumentRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ['transcript', 'certificate', 'character', 'coursework', 'other'],
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    department: {
      type: String,
    },
    program: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    academicYear: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    amount: {
      type: Number,
      default: 0,
    },
    rejectionReason: String,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    qrCode: String,
    trackingNumber: {
      type: String,
      unique: true,
      default: () => `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models && mongoose.models.DocumentRequest) ||
  mongoose.model<IDocumentRequest>('DocumentRequest', documentRequestSchema);
