import { useContext } from 'react';
import DictionaryContext from '../context/DictionaryContext.ts';
import type { Dictionary } from '../utils/getDictionary.ts';

export default function useDictionary(): Dictionary {
  const dictionary = useContext(DictionaryContext);

  if (!dictionary) {
    throw new Error(
      'useDictionary must be used within a DictionaryContext provider'
    );
  }

  return dictionary;
}
