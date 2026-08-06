import { Request, Response } from 'express';
import { catchAsync } from '../../../core/utils/catchAsync';
import { FileModel } from '../models/File';
import { AppError } from '../../../core/errors/AppError';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const FileController = {
  uploadFile: catchAsync(async (req: Request, res: Response) => {
    const { filename: originalname, mimetype, size, base64Data } = req.body;

    if (!base64Data) {
      throw new AppError('No file data provided', 400);
    }

    const userId = (req.user as any).id;
    const ext = path.extname(originalname) || '.bin';
    const uniqueFilename = `${crypto.randomUUID()}${ext}`;
    
    // Decode base64 and write to disk
    const base64Content = base64Data.split(';base64,').pop();
    const uploadPath = path.join(__dirname, '../../../../uploads', uniqueFilename);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(path.dirname(uploadPath))) {
      fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
    }

    fs.writeFileSync(uploadPath, base64Content, { encoding: 'base64' });

    const fileUrl = `/uploads/${uniqueFilename}`;

    const newFile = await FileModel.create({
      uploaderId: userId,
      originalName: originalname,
      filename: uniqueFilename,
      mimetype,
      size,
      url: fileUrl
    });

    res.status(201).json({
      success: true,
      data: { file: newFile }
    });
  }),

  getMyFiles: catchAsync(async (req: Request, res: Response) => {
    const files = await FileModel.find({ uploaderId: (req.user as any).id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: { files }
    });
  })
};
