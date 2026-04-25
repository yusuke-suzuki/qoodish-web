import { AddAPhoto } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { memo, useCallback, useEffect, useId, useState } from 'react';
import fileToDataUrl from '../../utils/fileToDataUrl';

type Props = {
  onChange: (dataUrls: string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  color?: 'inherit' | 'disabled' | 'secondary' | 'action' | 'primary' | 'error';
};

export default memo(function AddPhotoButton({
  onChange,
  disabled,
  multiple,
  color
}: Props) {
  const inputId = useId();
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
        multiple={!!multiple}
        id={inputId}
        type="file"
        onChange={handleImageFilesChange}
      />

      <label htmlFor={inputId}>
        <IconButton component="span" size="small" disabled={disabled}>
          <AddAPhoto color={color ? color : 'secondary'} />
        </IconButton>
      </label>
    </>
  );
});
