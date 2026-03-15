import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  requestId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models && mongoose.models.Notification) || mongoose.model<INotification>('Notification', notificationSchema);
