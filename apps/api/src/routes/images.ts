import type { ImageUpload } from '@qoodish/api-contract';
import { Hono } from 'hono';
import { createDirectUpload } from '../cloudflare-images.ts';
import { createImage } from '../images.ts';
import {
  authenticateUser,
  type ViewerEnv
} from '../middleware/authenticate-user.ts';

const app = new Hono<ViewerEnv>();

app.use(authenticateUser);

app.post('/', async (c) => {
  const upload = await createDirectUpload(c.env);
  const id = await createImage(c.get('db'), {
    userId: c.get('viewer').id,
    url: upload.url
  });

  return c.json<ImageUpload>({ id, upload_url: upload.uploadUrl });
});

export default app;
