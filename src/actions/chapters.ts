'use server';

import type { SerializedEditorState } from 'lexical';
import type { Chapter, MapFeatureCollection } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { CHAPTERS_TAG, chapterTag, mapTag, userTag } from '../lib/cacheTags.ts';
import { getChapterFeed } from '../lib/chapters.ts';
import { revalidateTags } from '../lib/revalidate.ts';
import {
  assertChapterContent,
  ChapterContentError
} from '../utils/chapterContentSchema.ts';

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

// The body reaches the API as whatever the client sent; only what the
// editor can produce is allowed through.
function invalidContent(content: unknown): string | null {
  try {
    assertChapterContent(content);
    return null;
  } catch (error) {
    if (error instanceof ChapterContentError) {
      return error.message;
    }

    throw error;
  }
}

type CreateChapterParams = {
  title: string;
  content: SerializedEditorState;
  map_features?: MapFeatureCollection;
  journey_id?: number;
};

type UpdateChapterParams = {
  title?: string;
  status?: 'draft' | 'published';
  content?: SerializedEditorState;
  map_features?: MapFeatureCollection;
  image_ids?: number[];
};

export async function fetchMoreChapterFeed(
  lang: string,
  nextTimestamp: string,
  nextId: number
): Promise<Chapter[]> {
  return getChapterFeed(lang, nextTimestamp, nextId);
}

export async function createChapter(
  mapId: number,
  params: CreateChapterParams
): Promise<ActionResult<Chapter>> {
  const contentError = invalidContent(params.content);

  if (contentError) {
    return { success: false, error: contentError };
  }

  const { data, error } = await apiFetch<Chapter>(`/maps/${mapId}/chapters`, {
    method: 'POST',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([
    CHAPTERS_TAG,
    mapTag(mapId),
    data && userTag(data.author.id)
  ]);

  return { success: true, data };
}

export async function updateChapter(
  chapterId: number,
  params: UpdateChapterParams
): Promise<ActionResult<Chapter>> {
  const contentError =
    params.content === undefined ? null : invalidContent(params.content);

  if (contentError) {
    return { success: false, error: contentError };
  }

  const { data, error } = await apiFetch<Chapter>(`/me/chapters/${chapterId}`, {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([
    chapterTag(chapterId),
    CHAPTERS_TAG,
    data?.map_id && mapTag(data.map_id),
    data && userTag(data.author.id)
  ]);

  return { success: true, data };
}

export async function deleteChapter(
  chapterId: number,
  mapId?: number | null,
  authorId?: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/me/chapters/${chapterId}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([
    chapterTag(chapterId),
    CHAPTERS_TAG,
    mapId && mapTag(mapId),
    authorId && userTag(authorId)
  ]);

  return { success: true };
}
