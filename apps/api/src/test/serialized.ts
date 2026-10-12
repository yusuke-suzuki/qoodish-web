import { IMAGE_BASE, ids } from './world.ts';

export function variants(name: string) {
  return {
    avatar: `${IMAGE_BASE}/${name}/avatar`,
    card: `${IMAGE_BASE}/${name}/card`,
    hero: `${IMAGE_BASE}/${name}/hero`,
    ogp: `${IMAGE_BASE}/${name}/ogp`,
    url: `${IMAGE_BASE}/${name}/public`
  };
}

export const alice = {
  id: ids.alice,
  name: 'Alice',
  image: variants('alice'),
  image_url: `${IMAGE_BASE}/alice/public`
};

export const bob = { id: ids.bob, name: 'Bob', image: null, image_url: '' };

export const carol = {
  id: ids.carol,
  name: 'Carol',
  image: null,
  image_url: ''
};

export const notFound = { title: 'NotFound', detail: 'Resource not found.' };
