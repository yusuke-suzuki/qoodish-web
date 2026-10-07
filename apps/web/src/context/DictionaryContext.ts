import { createContext } from 'react';
import type { Dictionary } from '../utils/getDictionary.ts';

const DictionaryContext = createContext<Dictionary | null>(null);

export default DictionaryContext;
