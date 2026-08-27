'use client';

import type { SerializedEditorState } from 'lexical';
import { enqueueSnackbar } from 'notistack';
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState
} from 'react';
import type { Chapter, MapFeatureCollection } from '../../types/index.ts';
import { deleteChapter, updateChapter } from '../actions/chapters.ts';
import useDictionary from './useDictionary.ts';

const AUTOSAVE_DELAY = 800;

export default function useChapter(initialChapter: Chapter) {
  const dictionary = useDictionary();

  const [chapter, setChapter] = useState<Chapter>(initialChapter);
  const [savedAt, setSavedAt] = useState(initialChapter.updated_at);

  const saveErrorNotifiedRef = useRef(false);

  // A flush that fires after the chapter is deleted would resurrect it.
  const discardedRef = useRef(false);

  // The debounce timer and the callers that await a save can both reach for a
  // flush; sharing the in-flight one keeps them from issuing competing writes.
  // The stamp identifies which draft a request carries, so a flush holding a
  // newer draft chains after the request instead of being swallowed by it.
  const inFlightRef = useRef<{
    stamp: string;
    request: Promise<boolean>;
  } | null>(null);

  const flush = (draft?: Chapter): Promise<boolean> => {
    const current = draft ?? chapter;

    // A discarded chapter has nothing left to save, and a draft already on
    // the server is saved; callers that report to the user need those two
    // apart rather than both arriving as "no request was made".
    if (discardedRef.current) {
      return Promise.resolve(false);
    }

    if (current.updated_at === savedAt) {
      return inFlightRef.current?.request ?? Promise.resolve(true);
    }

    const inFlight = inFlightRef.current;
    const stamp = current.updated_at;

    if (inFlight && inFlight.stamp === stamp) {
      return inFlight.request;
    }

    const request = (async () => {
      try {
        if (inFlight) {
          // A failed earlier save must not block this newer draft, so only
          // wait for it to settle.
          await inFlight.request.catch(() => false);
        }

        // The chapter may have been discarded while the earlier save was
        // settling; a request issued now would recreate it.
        if (discardedRef.current) {
          return false;
        }

        const { success } = await updateChapter(current.id, {
          title: current.title,
          status: current.status,
          content: current.content,
          map_features: current.map_features
        });

        if (success) {
          setSavedAt(stamp);
          saveErrorNotifiedRef.current = false;
          return true;
        }

        if (!saveErrorNotifiedRef.current) {
          saveErrorNotifiedRef.current = true;
          enqueueSnackbar(dictionary['save chapter failed'], {
            variant: 'error'
          });
        }

        return false;
      } finally {
        if (inFlightRef.current?.request === request) {
          inFlightRef.current = null;
        }
      }
    })();

    inFlightRef.current = { stamp, request };

    return request;
  };

  // The debounce timer and the pagehide listener outlive the render that
  // registered them, so they flush through an effect event, which always
  // sees the latest committed values. Event handlers call flush directly.
  const flushLatest = useEffectEvent(flush);

  useEffect(() => {
    if (chapter.updated_at === savedAt) {
      return;
    }

    const timer = window.setTimeout(() => flushLatest(), AUTOSAVE_DELAY);

    return () => window.clearTimeout(timer);
  }, [chapter, savedAt]);

  useEffect(() => {
    const handlePageHide = () => {
      flushLatest();
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      flushLatest();
    };
  }, []);

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

  const discardChapter = async () => {
    if (discardedRef.current) {
      return { success: false };
    }

    const result = await deleteChapter(chapter.id);

    if (result.success) {
      discardedRef.current = true;
    }

    return result;
  };

  const updateCover = async (imageIds: number[]) => {
    if (discardedRef.current) {
      return { success: false };
    }

    // Persist any pending title/content edits first so the cover-only
    // partial update does not race the debounced autosave.
    await flush();

    const { success, data } = await updateChapter(chapter.id, {
      image_ids: imageIds
    });

    if (success && data) {
      setChapter((prev) => ({ ...prev, image: data.image }));
      return { success: true };
    }

    enqueueSnackbar(dictionary['an error occurred'], { variant: 'error' });
    return { success: false };
  };

  const changeStatus = async (status: Chapter['status']) => {
    if (discardedRef.current) {
      return { success: false };
    }

    // The status travels through the shared save pipeline as a normal draft:
    // a dedicated status request would race the autosave, and adopting its
    // response into state would overwrite edits typed while it was on the
    // wire.
    const next: Chapter = {
      ...chapter,
      status,
      updated_at: new Date().toISOString()
    };

    setChapter(next);

    // flush notifies its own failures but dedups repeats; an explicit save
    // must always be able to report, so the dedup flag resets first.
    saveErrorNotifiedRef.current = false;

    const saved = await flush(next);

    if (!saved) {
      // Leaving the new status on screen would claim the chapter is published
      // when the server still has it as a draft. Edits typed while the
      // request was in flight stay; only the status goes back.
      setChapter((current) => ({ ...current, status: chapter.status }));
    }

    return { success: saved };
  };

  const publishChapter = () => changeStatus('published');

  const unpublishChapter = () => changeStatus('draft');

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
