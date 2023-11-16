import { AddAPhoto } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';
import fileToDataUrl from '../../utils/fileToDataUrl';

type Props = {
  id: string;
  onChange: (dataUrls: string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  color?: 'inherit' | 'disabled' | 'secondary' | 'action' | 'primary' | 'error';
};

export default memo(function AddPhotoButton({
  id,
  onChange,
  disabled,
  multiple,
  color
}: Props) {
  const [dataUrls, setDataUrls] = useState<string[] | undefined>(undefined);

  const handleImageFilesChange = useCallback(async (e) => {
    const files: File[] = Array.from(e.target.files);
    const items = [];

    for (const file of files) {
      const dataUrl = await fileToDataUrl(file);
      items.push(dataUrl);
    }

    setDataUrls(items);
  }, []);

  useEffect(() => {
    if (dataUrls) {
      onChange(dataUrls);
    }
  }, [dataUrls, onChange]);

  return (
    <>
      <input
        accept="image/*"
        style={{ display: 'none' }}
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
