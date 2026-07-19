'use client';

import type { SerializedEditorState } from 'lexical';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Chapter } from '../../types';
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

  const flush = useCallback(async () => {
    const current = latestRef.current;

    if (!current || current.updated_at === savedAtRef.current) {
      return;
    }

    const stamp = current.updated_at;
    const { success } = await updateChapter(current.id, {
      title: current.title,
      status: current.status,
      content: current.content
    });

    if (success) {
      setSavedAt(stamp);
      saveErrorNotifiedRef.current = false;
      return;
    }

    if (!saveErrorNotifiedRef.current) {
      saveErrorNotifiedRef.current = true;
      enqueueSnackbar(dictionary['save chapter failed'], { variant: 'error' });
    }
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

  const publishChapter = useCallback(() => {
    mutate((current) => ({ ...current, status: 'published' }));
  }, [mutate]);

  const unpublishChapter = useCallback(() => {
    mutate((current) => ({ ...current, status: 'draft' }));
  }, [mutate]);

  return {
    chapter,
    updateTitle,
    updateContent,
    discardChapter,
    publishChapter,
    unpublishChapter
  };
}
