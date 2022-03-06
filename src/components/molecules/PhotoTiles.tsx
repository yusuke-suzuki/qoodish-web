import { memo, useCallback } from 'react';
import {
  createStyles,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  makeStyles,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import { CancelOutlined } from '@material-ui/icons';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      overflow: 'hidden'
    },
    gridList: {
      flexWrap: 'nowrap',
      // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
      transform: 'translateZ(0)',
      width: '100%'
    },
    tileBar: {
      background:
        'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, ' +
        'rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
      zIndex: 1
    }
  })
);

type Props = {
  photoURLs: string[];
  variant?: 'default' | 'preview';
  onRemove?: Function;
};

export default memo(function PhotoTiles(props: Props) {
  const { photoURLs, variant, onRemove } = props;

  const handleRemoveClick = useCallback(
    index => {
      onRemove(index);
    },
    [onRemove]
  );

  const classes = useStyles();
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <div className={classes.root}>
      <GridList
        className={classes.gridList}
        cols={smUp ? 2.5 : 1.5}
        cellHeight={smUp ? 180 : 120}
      >
        {photoURLs.map((url, i) => (
          <GridListTile
            key={i}
            component={variant === 'default' ? 'a' : 'li'}
            href={url}
            target="_blank"
            rel="noopener"
          >
            {variant === 'preview' && (
              <GridListTileBar
                titlePosition="top"
                actionIcon={
                  <IconButton onClick={() => handleRemoveClick(i)}>
                    <CancelOutlined htmlColor={theme.palette.common.white} />
                  </IconButton>
                }
                actionPosition="right"
                className={classes.tileBar}
              />
            )}
            <img src={url} />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
});
