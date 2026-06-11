import { useCallback, useMemo, useState } from 'react';
import type { Image } from '../../types';
import uploadImage from '../utils/uploadImage';

export type PhotoItem =
  | { key: string; status: 'uploading'; previewUrl: string }
  | { key: string; status: 'uploaded'; image: Image };

export default function usePhotoUploads() {
  const [items, setItems] = useState<PhotoItem[]>([]);

  const isUploading = useMemo(
    () => items.some((item) => item.status === 'uploading'),
    [items]
  );

  const uploadedImages = useMemo(
    () =>
      items.flatMap((item) => (item.status === 'uploaded' ? [item.image] : [])),
    [items]
  );

  const upload = useCallback(async (dataUrls: string[]) => {
    const pending = dataUrls.map((dataUrl) => ({
      key: crypto.randomUUID(),
      status: 'uploading' as const,
      previewUrl: dataUrl
    }));
    setItems((prevState) => [...prevState, ...pending]);

    let failed = false;

    for (const item of pending) {
      try {
        const uploaded = await uploadImage(item.previewUrl);
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
      }
    }

    if (failed) {
      throw new Error('Failed to upload one or more images');
    }
  }, []);

  const removeAt = useCallback((index: number) => {
    setItems((prevState) => prevState.filter((_item, i) => i !== index));
  }, []);

  const reset = useCallback((images: Image[] = []) => {
    setItems(
      images.map((image) => ({
        key: crypto.randomUUID(),
        status: 'uploaded',
        image
      }))
    );
  }, []);

  return { items, isUploading, uploadedImages, upload, removeAt, reset };
}
