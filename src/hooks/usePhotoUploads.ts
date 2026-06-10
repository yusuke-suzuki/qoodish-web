import { useCallback, useMemo, useState } from 'react';
import uploadImage, { type UploadedImage } from '../utils/uploadImage';

export type PhotoItem =
  | { key: string; status: 'uploading'; url: string }
  | { key: string; status: 'uploaded'; url: string; id: number };

export default function usePhotoUploads() {
  const [items, setItems] = useState<PhotoItem[]>([]);

  const isUploading = useMemo(
    () => items.some((item) => item.status === 'uploading'),
    [items]
  );

  const uploadedIds = useMemo(
    () =>
      items.flatMap((item) => (item.status === 'uploaded' ? [item.id] : [])),
    [items]
  );

  const upload = useCallback(async (dataUrls: string[]) => {
    const pending = dataUrls.map<PhotoItem>((dataUrl) => ({
      key: crypto.randomUUID(),
      status: 'uploading',
      url: dataUrl
    }));
    setItems((prevState) => [...prevState, ...pending]);

    let failed = false;

    for (const item of pending) {
      try {
        const uploaded = await uploadImage(item.url);
        setItems((prevState) =>
          prevState.map((prevItem) =>
            prevItem.key === item.key
              ? { key: item.key, status: 'uploaded', ...uploaded }
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

  const reset = useCallback((images: UploadedImage[] = []) => {
    setItems(
      images.map((image) => ({
        key: crypto.randomUUID(),
        status: 'uploaded',
        ...image
      }))
    );
  }, []);

  return { items, isUploading, uploadedIds, upload, removeAt, reset };
}
