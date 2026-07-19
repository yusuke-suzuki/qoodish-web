'use client';

import { TextField } from '@mui/material';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { JourneyCheckin } from '../../../types';
import useDictionary from '../../hooks/useDictionary';

const AUTOSAVE_DELAY = 800;
const NOTE_MAX_LENGTH = 500;

type Props = {
  checkin: JourneyCheckin;
  onSave: (checkin: JourneyCheckin, note: string | null) => Promise<void>;
};

function CheckinNoteField({ checkin, onSave }: Props) {
  const dictionary = useDictionary();

  const [value, setValue] = useState(checkin.note ?? '');
  const [revision, setRevision] = useState(0);

  const stateRef = useRef({ checkin, value, dirty: false, onSave });
  stateRef.current = { ...stateRef.current, checkin, value, onSave };

  const flush = useCallback(() => {
    const {
      checkin: latest,
      value: draft,
      dirty: pending,
      onSave: save
    } = stateRef.current;

    if (!pending) {
      return;
    }

    stateRef.current.dirty = false;
    save(latest, draft.trim() ? draft : null);
  }, []);

  useEffect(() => {
    if (revision === 0) {
      return;
    }

    const timer = window.setTimeout(flush, AUTOSAVE_DELAY);

    return () => window.clearTimeout(timer);
  }, [revision, flush]);

  useEffect(() => {
    window.addEventListener('pagehide', flush);

    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);

  return (
    <TextField
      fullWidth
      multiline
      size="small"
      variant="standard"
      value={value}
      placeholder={dictionary['chapter spot placeholder']}
      onChange={(event) => {
        setValue(event.target.value);
        stateRef.current.dirty = true;
        setRevision((current) => current + 1);
      }}
      onBlur={flush}
      slotProps={{
        input: {
          disableUnderline: true,
          sx: (theme) => ({
            ...theme.typography.body2
          })
        },
        htmlInput: {
          'aria-label': dictionary['chapter spot placeholder'],
          maxLength: NOTE_MAX_LENGTH
        }
      }}
    />
  );
}

export default memo(CheckinNoteField);
