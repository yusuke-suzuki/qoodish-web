import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from '../utils/metadata.ts';

// Only production is open to crawlers; a preview or dev deployment serving
// the same allow-all would be indexed as a duplicate of the real site.
export default function robots(): MetadataRoute.Robots {
  if (process.env.APP_ENV !== 'production') {
    return {
      rules: { userAgent: '*', disallow: '/' }
    };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`
  };
}
