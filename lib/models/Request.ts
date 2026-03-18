import mongoose, { Schema, Document } from 'mongoose';

export interface IRequest extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  requestType: 'ID_REPLACEMENT' | 'DOCUMENT' | 'MA_DOCUMENT';
  documentType?: string;
  quantity?: number;
  description?: string;
  reason?: string;
  replacementType?: string;
  urgency?: 'Normal' | 'Urgent';
  purpose?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVENUE_REVIEW' | 'COMPLETED' | 'FORMAL_RECEIPT_PENDING' | 'FORMAL_RECEIPT_ISSUED';
  paymentFile?: string;
  paymentVerified: boolean;
  adminComment?: string;
  deliveryMethod: 'EMAIL' | 'POSTAL';
  deliveryDate?: Date;
  registrarNotes?: string;
  trackingNumber: string;
  department?: string;
  program?: string;
  phoneNumber?: string;
  academicYear?: string;
  revenueLetterId?: string;
  revenueLetterContent?: string;
  revenueLetterSentAt?: Date;
  sentToRevenueAt?: Date;
  paymentRequested?: boolean;
  paymentRequestedAt?: Date;
  paymentAmount?: number;
  paymentAccountDetails?: string;
  paymentReceiptPath?: string;
  paymentTransactionId?: string;
  paymentReceiptUploadedAt?: Date;
  paymentAdditionalInfo?: string;
  formalReceiptId?: string;
  formalReceiptContent?: string;
  formalReceiptIssuedAt?: Date;
  formalReceiptIssuedBy?: string;
  forwardedToRegistrarAt?: Date;
  availableToRegistrar?: boolean;
  registrarProcessed?: boolean;
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
      enum: ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'REVENUE_REVIEW'],
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
    urgency: {
      type: String,
      enum: ['Normal', 'Urgent'],
      default: 'Normal',
    },
    purpose: {
      type: String,
    },
    sentToRevenueAt: {
      type: Date,
    },
    revenueLetterId: {
      type: String,
    },
    revenueLetterContent: {
      type: String,
    },
    revenueLetterSentAt: {
      type: Date,
    },
    paymentRequested: {
      type: Boolean,
      default: false,
    },
    paymentRequestedAt: {
      type: Date,
    },
    paymentAmount: {
      type: Number,
    },
    paymentAccountDetails: {
      type: String,
    },
    paymentReceiptPath: {
      type: String,
    },
    paymentTransactionId: {
      type: String,
    },
    paymentReceiptUploadedAt: {
      type: Date,
    },
    paymentAdditionalInfo: {
      type: String,
    },
    // Formal receipt information
    formalReceiptId: {
      type: String,
    },
    formalReceiptContent: {
      type: String,
    },
    formalReceiptIssuedAt: {
      type: Date,
    },
    formalReceiptIssuedBy: {
      type: String,
    },
    forwardedToRegistrarAt: {
      type: Date,
    },
    availableToRegistrar: {
      type: Boolean,
      default: false,
    },
    registrarProcessed: {
      type: Boolean,
      default: false,
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
    quantity: {
      type: Number,
      default: 1,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models && mongoose.models.Request) || mongoose.model<IRequest>('Request', requestSchema);
