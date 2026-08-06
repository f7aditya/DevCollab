import { api } from "@/lib/api";

export interface UploadResponse {
  file: {
    _id: string;
    uploaderId: string;
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
    createdAt: string;
  };
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const base64Data = await fileToBase64(file);
  
  const payload = {
    filename: file.name,
    mimetype: file.type,
    size: file.size,
    base64Data
  };

  const response = await api.post(`/files/upload`, payload);
  return response.data;
};
