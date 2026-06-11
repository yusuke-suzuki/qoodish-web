import { Cancel } from '@mui/icons-material';
import {
  Box,
  Card,
  CardMedia,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { memo } from 'react';
import type { PhotoItem } from '../../hooks/usePhotoUploads';

type Props = {
  items: PhotoItem[];
  onDelete: (index: number) => void;
};

export default memo(function PhotoPreviewList({ items, onDelete }: Props) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <ImageList cols={mdUp ? 2 : 1} rowHeight={mdUp ? 320 : 240} gap={8}>
      {items.map((item, i) => {
        const imageUrl =
          item.status === 'uploading' ? item.previewUrl : item.image.card;

        return (
          <ImageListItem key={item.key}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardMedia
                component="img"
                image={imageUrl}
                height="100%"
                sx={{ opacity: item.status === 'uploading' ? 0.4 : 1 }}
              />

              {item.status === 'uploading' && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Card>

            <ImageListItemBar
              position="top"
              sx={{
                background: 'transparent'
              }}
              actionIcon={
                <IconButton
                  onClick={() => onDelete(i)}
                  disabled={item.status === 'uploading'}
                >
                  <Cancel />
                </IconButton>
              }
            />
          </ImageListItem>
        );
      })}
    </ImageList>
  );
});
