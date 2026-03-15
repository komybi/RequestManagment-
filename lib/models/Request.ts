import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  requestType: 'ID_REPLACEMENT' | 'DOCUMENT';
  documentType?: 'TRANSCRIPT' | 'CERTIFICATE' | 'ENROLLMENT_LETTER' | 'RECOMMENDATION_LETTER';
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
  paymentFile?: string;
  paymentVerified: boolean;
  adminComment?: string;
  deliveryMethod: 'EMAIL' | 'POSTAL';
  deliveryDate?: Date;
  registrarNotes?: string;
  trackingNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestType: {
      type: String,
      enum: ['ID_REPLACEMENT', 'DOCUMENT'],
      required: true,
    },
    documentType: {
      type: String,
      enum: ['TRANSCRIPT', 'CERTIFICATE', 'ENROLLMENT_LETTER', 'RECOMMENDATION_LETTER'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    paymentFile: {
      type: String,
    },
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    adminComment: {
      type: String,
    },
    deliveryMethod: {
      type: String,
      enum: ['EMAIL', 'POSTAL'],
      default: 'EMAIL',
    },
    deliveryDate: {
      type: Date,
    },
    registrarNotes: {
      type: String,
    },
    trackingNumber: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models && mongoose.models.Request) || mongoose.model<IRequest>('Request', requestSchema);
