import { AddAPhoto } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { type ChangeEvent, memo, useId } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import { splitOversizedImages } from '../../utils/uploadImage.ts';

type Props = {
  onChange: (files: File[]) => void;
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
  const dictionary = useDictionary();
  const inputId = useId();

  const handleImageFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { accepted, oversized } = splitOversizedImages(
      Array.from(e.target.files ?? [])
    );
    e.target.value = '';

    if (oversized.length > 0) {
      enqueueSnackbar(dictionary['image too large'], { variant: 'error' });
    }

    if (accepted.length > 0) {
      onChange(accepted);
    }
  };

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
