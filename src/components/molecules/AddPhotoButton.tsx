import { createStyles, IconButton, makeStyles } from '@material-ui/core';
import { AddAPhoto } from '@material-ui/icons';
import { memo, useCallback, useEffect, useState } from 'react';
import fileToDataUrl from '../../utils/fileToDataUrl';

const useStyles = makeStyles(() =>
  createStyles({
    input: {
      display: 'none'
    }
  })
);

type Props = {
  id: string;
  onChange: Function;
  disabled?: boolean;
  multiple?: boolean;
  color?: 'inherit' | 'disabled' | 'secondary' | 'action' | 'primary' | 'error';
};

export default memo(function AddPhotoButton(props: Props) {
  const { id, onChange, disabled, multiple, color } = props;
  const classes = useStyles();
  const [dataUrls, setDataUrls] = useState<string[]>([]);

  const handleImageFilesChange = useCallback(
    async e => {
      const files: File[] = Array.from(e.target.files);
      const items = [];

      for (let file of files) {
        const dataUrl = await fileToDataUrl(file);
        items.push(dataUrl);
      }

      setDataUrls(items);
    },
    [fileToDataUrl]
  );

  useEffect(() => {
    onChange(dataUrls);
  }, [dataUrls]);

  return (
    <>
      <input
        accept="image/*"
        className={classes.input}
        multiple={multiple ? true : false}
        id={id}
        type="file"
        onChange={handleImageFilesChange}
      />

      <label htmlFor={id}>
        <IconButton component="span" size="small" disabled={disabled}>
          <AddAPhoto color={color ? color : 'secondary'} />
        </IconButton>
      </label>
    </>
  );
});
