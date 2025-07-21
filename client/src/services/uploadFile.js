import { uploadToPinata } from './pinata';

export async function uploadFile(file) {
  return await uploadToPinata(file);
} 