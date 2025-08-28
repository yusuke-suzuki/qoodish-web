import { Cancel } from '@mui/icons-material';
import {
  Card,
  CardMedia,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { memo } from 'react';

type Props = {
  dataUrls: string[];
  onDelete: (index: number) => void;
};

export default memo(function PhotoPreviewList({ dataUrls, onDelete }: Props) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <ImageList cols={mdUp ? 2 : 1} rowHeight={mdUp ? 320 : 240} gap={8}>
      {dataUrls.map((dataUrl, i) => (
        <ImageListItem key={dataUrl}>
          <Card sx={{ height: '100%' }}>
            <CardMedia component="img" image={dataUrl} height="100%" />
          </Card>

          <ImageListItemBar
            position="top"
            sx={{
              background: 'transparent'
            }}
            actionIcon={
              <IconButton onClick={() => onDelete(i)}>
                <Cancel />
              </IconButton>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
});
