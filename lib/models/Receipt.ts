import mongoose, { Schema, Document } from 'mongoose';

export interface IReceipt extends Document {
  _id: mongoose.Types.ObjectId;
  requestId: mongoose.Types.ObjectId;
  fileURL: string;
  paymentVerifiedAt: Date;
  generatedBy: mongoose.Types.ObjectId;
}

const receiptSchema = new Schema<IReceipt>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      unique: true,
    },
    fileURL: {
      type: String,
      required: true,
    },
    paymentVerifiedAt: {
      type: Date,
      default: Date.now,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models && mongoose.models.Receipt) || mongoose.model<IReceipt>('Receipt', receiptSchema);
