import { permanentRedirect } from 'next/navigation';
import { localePath } from '../../../utils/locales.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

// Signing in happens in a sheet over whatever the reader was looking at, so
// this route has nothing left to render. It stays behind as a redirect for the
// links and bookmarks that still point at it.
export default async function LoginPage({ params }: Props) {
  const { lang } = await params;

  permanentRedirect(localePath(lang));
}
