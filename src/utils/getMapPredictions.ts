import match from 'autosuggest-highlight/match';

export default function getMapPredictions(maps: any, input: string) {
  return maps
    .filter(map => {
      const matches = match(map.name, input);

      return matches.length > 0;
    })
    .slice(0, 5);
}
