import { useState } from 'react';
import type { Image } from '../../types/index.ts';
import uploadImage from '../utils/uploadImage.ts';

export type PhotoItem =
  | { key: string; status: 'uploading'; previewUrl: string }
  | { key: string; status: 'uploaded'; image: Image };

export default function usePhotoUploads() {
  const [items, setItems] = useState<PhotoItem[]>([]);

  const isUploading = items.some((item) => item.status === 'uploading');

  const uploadedImages = items.flatMap((item) =>
    item.status === 'uploaded' ? [item.image] : []
  );

  const upload = async (files: File[]) => {
    const pending = files.map((file) => ({
      key: crypto.randomUUID(),
      status: 'uploading' as const,
      previewUrl: URL.createObjectURL(file),
      file
    }));
    setItems((prevState) => [...prevState, ...pending]);

    let failed = false;

    for (const item of pending) {
      try {
        const uploaded = await uploadImage(item.file);
        setItems((prevState) =>
          prevState.map((prevItem) =>
            prevItem.key === item.key
              ? { key: item.key, status: 'uploaded', image: uploaded }
              : prevItem
          )
        );
      } catch (_error) {
        failed = true;
        setItems((prevState) =>
          prevState.filter((prevItem) => prevItem.key !== item.key)
        );
      } finally {
        URL.revokeObjectURL(item.previewUrl);
      }
    }

    if (failed) {
      throw new Error('Failed to upload one or more images');
    }
  };

  const removeAt = (index: number) => {
    setItems((prevState) => prevState.filter((_item, i) => i !== index));
  };

  const reset = (images: Image[] = []) => {
    setItems(
      images.map((image) => ({
        key: crypto.randomUUID(),
        status: 'uploaded',
        image
      }))
    );
  };

  return { items, isUploading, uploadedImages, upload, removeAt, reset };
}
