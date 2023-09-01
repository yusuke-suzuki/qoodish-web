import {
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Switch
} from '@mui/material';
import { ChangeEvent, memo, useEffect, useState } from 'react';
import { AppMap } from '../../../types';
import useDictionary from '../../hooks/useDictionary';

type MapOptions = {
  isPrivate: boolean;
  isInvitable: boolean;
  isShared: boolean;
};

type Props = {
  currentMap?: AppMap | null;
  onChange: (options: MapOptions) => void;
};

function MapOptions({ currentMap, onChange }: Props) {
  const dictionary = useDictionary();

  const [isPrivate, setIsPrivate] = useState(false);
  const [isInvitable, setIsInvitable] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (currentMap) {
      setIsPrivate(currentMap.private);
      setIsInvitable(currentMap.invitable);
      setIsShared(currentMap.shared);
    }
  }, [currentMap]);

  useEffect(() => {
    onChange({ isPrivate, isInvitable, isShared });
  }, [isPrivate, isInvitable, isShared, onChange]);

  return (
    <FormControl component="fieldset" color="secondary" margin="normal">
      <FormLabel component="legend">{dictionary.options}</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              color="secondary"
              checked={isShared}
              onChange={(
                _event: ChangeEvent<HTMLInputElement>,
                checked: boolean
              ) => setIsShared(checked)}
            />
          }
          label={dictionary['allow followers to post']}
        />
        <FormControlLabel
          control={
            <Switch
              color="secondary"
              checked={isPrivate}
              onChange={(
                _event: ChangeEvent<HTMLInputElement>,
                checked: boolean
              ) => setIsPrivate(checked)}
            />
          }
          label={dictionary['set this map to private']}
        />
        <FormControlLabel
          control={
            <Switch
              color="secondary"
              checked={isInvitable}
              onChange={(
                _event: ChangeEvent<HTMLInputElement>,
                checked: boolean
              ) => setIsInvitable(checked)}
            />
          }
          label={dictionary['allow followers to invite']}
        />
      </FormGroup>
    </FormControl>
  );
}

export default memo(MapOptions);
