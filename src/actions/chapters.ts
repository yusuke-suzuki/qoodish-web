'use server';

import type { SerializedEditorState } from 'lexical';
import type { Chapter, MapFeatureCollection } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { CHAPTERS_TAG, chapterTag, mapTag, userTag } from '../lib/cacheTags.ts';
import { revalidateTags } from '../lib/revalidate.ts';

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

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

export async function createChapter(
  mapId: number,
  params: CreateChapterParams
): Promise<ActionResult<Chapter>> {
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
