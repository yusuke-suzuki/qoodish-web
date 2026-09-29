import { useContext } from 'react';
import DictionaryContext from '../context/DictionaryContext.ts';
import type { Dictionary } from '../utils/getDictionary.ts';

export default function useDictionary(): Dictionary {
  return useContext(DictionaryContext);
}
