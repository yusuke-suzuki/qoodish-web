'use client';

import { Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';

type Props = {
  revisions: { effectiveOn: string; date: string }[];
};

export default function PreviousTermsList({ revisions }: Props) {
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  if (revisions.length < 1) return null;

  return (
    <>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        {dictionary['previous versions']}
      </Typography>
      <Typography component="ul">
        {revisions.map(({ effectiveOn, date }) => (
          <Typography component="li" key={effectiveOn}>
            <Link
              component={NextLink}
              href={localePath(`/terms/archive/${effectiveOn}`)}
            >
              {date}
            </Link>
          </Typography>
        ))}
      </Typography>
    </>
  );
}
