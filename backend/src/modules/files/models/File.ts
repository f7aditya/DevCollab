import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  uploaderId: mongoose.Types.ObjectId;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    uploaderId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    originalName: { 
      type: String, 
      required: true 
    },
    filename: { 
      type: String, 
      required: true,
      unique: true
    },
    mimetype: { 
      type: String, 
      required: true 
    },
    size: { 
      type: Number, 
      required: true 
    },
    url: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const FileModel = mongoose.model<IFile>('File', fileSchema);
