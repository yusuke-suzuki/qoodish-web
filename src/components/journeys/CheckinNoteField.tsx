'use client';

import { TextField } from '@mui/material';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { JourneyCheckin } from '../../../types/index.ts';
import useDictionary from '../../hooks/useDictionary.ts';

const AUTOSAVE_DELAY = 800;
const NOTE_MAX_LENGTH = 500;

type Props = {
  checkin: JourneyCheckin;
  onSave: (checkin: JourneyCheckin, note: string | null) => Promise<boolean>;
};

function CheckinNoteField({ checkin, onSave }: Props) {
  const dictionary = useDictionary();

  const [value, setValue] = useState(checkin.note ?? '');
  const [revision, setRevision] = useState(0);

  const stateRef = useRef({ checkin, value, dirty: false, onSave });

  // flush runs from a timer, a pagehide listener and unmount, so it reads the
  // latest values through the ref rather than being rebuilt on every keystroke
  // and re-arming both listeners with it. The draft is not synced here: pagehide
  // can fire between the keystroke and this effect, and flush would then save
  // the previous draft and clear dirty with it.
  useEffect(() => {
    stateRef.current.checkin = checkin;
    stateRef.current.onSave = onSave;
  });

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

    // Treating a draft that failed to save as saved would lose it outright:
    // even the flush on leaving the page would find nothing to send. A
    // failure puts it back in the pending state so the next flush retries.
    save(latest, draft.trim() ? draft : null)
      .catch(() => false)
      .then((saved) => {
        if (!saved) {
          stateRef.current.dirty = true;
        }
      });
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
      placeholder={dictionary['checkin note placeholder']}
      onChange={(event) => {
        setValue(event.target.value);
        stateRef.current.value = event.target.value;
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
          'aria-label': dictionary['checkin note placeholder'],
          maxLength: NOTE_MAX_LENGTH
        }
      }}
    />
  );
}

export default memo(CheckinNoteField);
