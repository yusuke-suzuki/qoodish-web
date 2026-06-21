'use client';

import { Avatar, AvatarGroup, ButtonBase } from '@mui/material';
import { memo, useState } from 'react';
import type { AppMap, Coauthor, Profile } from '../../../types';
import CoauthorsDialog from './CoauthorsDialog';

type Props = {
  coauthors: Coauthor[];
  map: AppMap | null;
  currentProfile: Profile | null;
};

function Coauthors({ coauthors, map, currentProfile }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAuthor = Boolean(
    map && currentProfile && currentProfile.id === map.author.id
  );

  const avatars = (
    <AvatarGroup max={9}>
      {coauthors.map((coauthor) => (
        <Avatar
          key={coauthor.id}
          alt={coauthor.name}
          src={coauthor.image?.avatar}
          sx={{ width: 40, height: 40 }}
        />
      ))}
    </AvatarGroup>
  );

  if (!isAuthor) {
    return avatars;
  }

  return (
    <>
      <ButtonBase
        onClick={() => setDialogOpen(true)}
        sx={{ borderRadius: 1, p: 0.5 }}
      >
        {avatars}
      </ButtonBase>

      <CoauthorsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        map={map}
        coauthors={coauthors}
      />
    </>
  );
}

export default memo(Coauthors);
