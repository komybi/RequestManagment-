import mongoose, { Schema, Document } from 'mongoose';

export interface ILetter extends Document {
  _id: mongoose.Types.ObjectId;
  requestId: mongoose.Types.ObjectId;
  fileURL: string;
  generatedAt: Date;
  sentToRevenue: boolean;
}

const letterSchema = new Schema<ILetter>(
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
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    sentToRevenue: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models && mongoose.models.Letter) || mongoose.model<ILetter>('Letter', letterSchema);
