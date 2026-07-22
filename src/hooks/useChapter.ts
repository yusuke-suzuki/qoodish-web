'use client';

import type { SerializedEditorState } from 'lexical';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Chapter, MapFeatureCollection } from '../../types';
import { deleteChapter, updateChapter } from '../actions/chapters';
import useDictionary from './useDictionary';

const AUTOSAVE_DELAY = 800;

export default function useChapter(initialChapter: Chapter) {
  const dictionary = useDictionary();

  const [chapter, setChapter] = useState<Chapter>(initialChapter);
  const [savedAt, setSavedAt] = useState(initialChapter.updated_at);

  const latestRef = useRef<Chapter | null>(chapter);
  latestRef.current = chapter;

  const savedAtRef = useRef(savedAt);
  savedAtRef.current = savedAt;

  const saveErrorNotifiedRef = useRef(false);

  // The debounce timer and the callers that await a save can both reach for a
  // flush; sharing the in-flight one keeps them from issuing competing writes.
  const inFlightRef = useRef<Promise<void> | null>(null);

  const flush = useCallback(async () => {
    const current = latestRef.current;

    if (!current || current.updated_at === savedAtRef.current) {
      return inFlightRef.current ?? undefined;
    }

    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    const stamp = current.updated_at;

    const request = (async () => {
      try {
        const { success } = await updateChapter(current.id, {
          title: current.title,
          status: current.status,
          content: current.content,
          map_features: current.map_features
        });

        if (success) {
          setSavedAt(stamp);
          saveErrorNotifiedRef.current = false;
          return;
        }

        if (!saveErrorNotifiedRef.current) {
          saveErrorNotifiedRef.current = true;
          enqueueSnackbar(dictionary['save chapter failed'], {
            variant: 'error'
          });
        }
      } finally {
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = request;

    return request;
  }, [dictionary]);

  useEffect(() => {
    if (chapter.updated_at === savedAt) {
      return;
    }

    const timer = window.setTimeout(flush, AUTOSAVE_DELAY);

    return () => window.clearTimeout(timer);
  }, [chapter, savedAt, flush]);

  useEffect(() => {
    window.addEventListener('pagehide', flush);

    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);

  const mutate = useCallback((updater: (chapter: Chapter) => Chapter) => {
    setChapter((current) => ({
      ...updater(current),
      updated_at: new Date().toISOString()
    }));
  }, []);

  const updateTitle = useCallback(
    (title: string) => {
      mutate((current) => ({ ...current, title }));
    },
    [mutate]
  );

  const updateContent = useCallback(
    (content: SerializedEditorState) => {
      mutate((current) => ({ ...current, content }));
    },
    [mutate]
  );

  const updateMapFeatures = useCallback(
    (map_features: MapFeatureCollection) => {
      mutate((current) => ({ ...current, map_features }));
    },
    [mutate]
  );

  const discardChapter = useCallback(async () => {
    const current = latestRef.current;

    if (!current) {
      return { success: false };
    }

    const result = await deleteChapter(current.id);

    if (result.success) {
      latestRef.current = null;
    }

    return result;
  }, []);

  const updateCover = useCallback(
    async (imageIds: number[]) => {
      const current = latestRef.current;

      if (!current) {
        return { success: false };
      }

      // Persist any pending title/content edits first so the cover-only
      // partial update does not race the debounced autosave.
      await flush();

      const { success, data } = await updateChapter(current.id, {
        image_ids: imageIds
      });

      if (success && data) {
        setChapter((prev) => ({ ...prev, image: data.image }));
        return { success: true };
      }

      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      return { success: false };
    },
    [flush, dictionary]
  );

  const changeStatus = useCallback(
    async (status: Chapter['status']) => {
      const current = latestRef.current;

      if (!current) {
        return { success: false };
      }

      // Persist pending title/content first so callers can navigate away
      // knowing the new status is saved, rather than racing the autosave.
      await flush();

      const { success, data } = await updateChapter(current.id, { status });

      if (success && data) {
        latestRef.current = data;
        setChapter(data);
        setSavedAt(data.updated_at);
        return { success: true };
      }

      enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
      return { success: false };
    },
    [flush, dictionary]
  );

  const publishChapter = useCallback(
    () => changeStatus('published'),
    [changeStatus]
  );

  const unpublishChapter = useCallback(
    () => changeStatus('draft'),
    [changeStatus]
  );

  const unsaved = chapter.updated_at !== savedAt;

  return {
    chapter,
    unsaved,
    updateTitle,
    updateContent,
    updateMapFeatures,
    updateCover,
    discardChapter,
    publishChapter,
    unpublishChapter
  };
}
