import { Avatar, AvatarGroup } from '@mui/material';
import { memo } from 'react';
import type { Coauthor } from '../../../types';

type Props = {
  coauthors: Coauthor[];
};

function Coauthors({ coauthors }: Props) {
  return (
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
}

export default memo(Coauthors);
