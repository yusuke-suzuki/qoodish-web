import { Grade } from '@mui/icons-material';
import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo } from 'react';
import useDictionary from '../../hooks/useDictionary';
import { usePopularMaps } from '../../hooks/usePopularMaps';
import SkeletonTrendingList from './SkeletonTrendingList';

const TrendingMaps = () => {
  const dictionary = useDictionary();
  const { maps } = usePopularMaps();

  return maps.length < 1 ? (
    <SkeletonTrendingList />
  ) : (
    <List
      subheader={
        <ListSubheader sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Grade color="secondary" />
          <Typography variant="subtitle1" color="text.primary">
            {dictionary['trending maps']}
          </Typography>
        </ListSubheader>
      }
      component={Paper}
      elevation={0}
      sx={{ pt: 2 }}
    >
      {maps.map((map, i) => (
        <ListItemButton
          key={map.id}
          LinkComponent={Link}
          title={map.name}
          href={`/maps/${map.id}`}
        >
          <ListItemAvatar>
            <Avatar
              src={map.thumbnail_url}
              alt={map.name}
              imgProps={{
                loading: 'lazy'
              }}
            />
          </ListItemAvatar>
          <ListItemText
            disableTypography={true}
            primary={
              <Typography variant="subtitle1" noWrap>
                {i + 1}. {map.name}
              </Typography>
            }
            secondary={
              <Typography component="p" noWrap color="text.secondary">
                {map.description}
              </Typography>
            }
          />
        </ListItemButton>
      ))}
    </List>
  );
};

export default memo(TrendingMaps);
