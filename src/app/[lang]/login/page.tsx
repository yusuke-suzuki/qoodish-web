import { permanentRedirect } from 'next/navigation';
import { localePath } from '../../../utils/locales.ts';

type Props = {
  params: Promise<{ lang: string }>;
};

// Signing in happens in a sheet, so this route has nothing to render. It stays
// behind as a redirect for the links and bookmarks that point at it.
export default async function LoginPage({ params }: Props) {
  const { lang } = await params;

  permanentRedirect(localePath(lang));
}
