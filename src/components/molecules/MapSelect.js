import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState } from 'redux-react-hook';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';

import I18n from '../../utils/I18n';

const MapSelect = props => {
  const { currentReview, onMapChange } = props;
  const [errorText, setErrorText] = useState(undefined);
  const [currentMapId, setMapId] = useState(undefined);

  const mapState = useCallback(
    state => ({
      currentMap: state.mapDetail.currentMap,
      postableMaps: state.maps.postableMaps
    }),
    []
  );

  const { currentMap, postableMaps } = useMappedState(mapState);

  const renderSelectValue = useCallback(mapId => {
    let map = postableMaps.find(map => {
      return map.id == mapId;
    });
    return map ? map.name : '';
  });

  const handleMapChange = useCallback(selectedMapId => {
    if (!selectedMapId) {
      setErrorText(I18n.t('map is required'));
    }
    setMapId(selectedMapId);
  });

  const initValue = useCallback(() => {
    if (currentMap) {
      setMapId(currentMap.id);
    } else if (postableMaps.length > 0) {
      setMapId(postableMaps[0].id);
    }
  });

  useEffect(() => {
    initValue();
  }, [currentMap, postableMaps]);

  useEffect(() => {
    onMapChange(currentMapId);
  }, [currentMapId]);

  return (
    <FormControl
      fullWidth
      error={errorText ? true : false}
      disabled={currentReview ? true : false}
      margin="normal"
      required
    >
      <InputLabel htmlFor="map-input">{I18n.t('map')}</InputLabel>
      <Select
        defaultValue={currentReview && currentReview.map.id}
        value={currentMapId ? currentMapId : ''}
        onChange={e => handleMapChange(e.target.value)}
        input={<Input id="map-input" style={{ padding: 20 }} />}
        renderValue={value => renderSelectValue(value)}
        style={{ height: 'auto' }}
        data-test="map-select"
      >
        {postableMaps.map(map => (
          <MenuItem key={map.id} value={map.id} data-test="map-item">
            <ListItemAvatar>
              <Avatar src={map.thumbnail_url} />
            </ListItemAvatar>
            <ListItemText
              disableTypography={true}
              primary={
                <Typography variant="subtitle1" noWrap>
                  {map.name}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{errorText}</FormHelperText>
    </FormControl>
  );
};

export default React.memo(MapSelect);
