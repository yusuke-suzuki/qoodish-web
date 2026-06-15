import { Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import Markdown, { type Components } from 'react-markdown';

type Props = {
  content: string;
};

const components: Components = {
  h1: ({ children }) => (
    <Typography variant="h4" component="h1" gutterBottom>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="subtitle1" component="h3" gutterBottom sx={{ mt: 2 }}>
      {children}
    </Typography>
  ),
  p: ({ children }) => (
    <Typography component="p" gutterBottom>
      {children}
    </Typography>
  ),
  a: ({ href, children }) => {
    if (href?.startsWith('/')) {
      return (
        <Link component={NextLink} href={href}>
          {children}
        </Link>
      );
    }

    return (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    );
  },
  ul: ({ children }) => (
    <Typography component="ul" gutterBottom>
      {children}
    </Typography>
  ),
  ol: ({ children }) => (
    <Typography component="ol" gutterBottom>
      {children}
    </Typography>
  ),
  li: ({ children }) => <Typography component="li">{children}</Typography>
};

export default function MarkdownContent({ content }: Props) {
  return <Markdown components={components}>{content}</Markdown>;
}
