import { getApp } from 'firebase/app';
import {
  type UploadResult,
  type UploadTask,
  getStorage,
  ref,
  uploadBytesResumable,
  uploadString
} from 'firebase/storage';

const basePath = `${process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT}/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`;

export default async function uploadToStorage(
  data: string | Blob | Uint8Array | ArrayBuffer,
  fileName: string,
  fileType: 'blob' | 'data_url'
): Promise<string> {
  const firebaseApp = getApp();
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, fileName);

  const metadata = {
    contentType: 'image/jpeg',
    cacheControl: `public,max-age=${30 * 24 * 60 * 60}` // 30 Days
  };

  let uploadTask: UploadTask;
  let uploadResult: UploadResult;

  if (fileType === 'blob') {
    uploadTask = uploadBytesResumable(storageRef, data as Blob, metadata);
  } else {
    uploadResult = await uploadString(
      storageRef,
      data as string,
      fileType,
      metadata
    );
  }

  if (uploadResult) {
    return `${basePath}/${uploadResult.metadata.fullPath}`;
  }

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload is ${progress}% done`);
      switch (snapshot.state) {
        case 'paused':
          console.log('Upload is paused');
          break;
        case 'running':
          break;
      }
    },
    (error) => {
      switch (error.code) {
        case 'storage/unauthorized':
          break;
        case 'storage/canceled':
          break;
        case 'storage/unknown':
          break;
      }
    },
    () => {
      return `${process.env.NEXT_PUBLIC_CLOUD_STORAGE_ENDPOINT}/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/${fileName}`;
    }
  );
}
