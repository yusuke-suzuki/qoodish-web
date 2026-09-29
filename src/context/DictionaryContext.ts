import { createContext } from 'react';
import type { Dictionary } from '../utils/getDictionary.ts';

const DictionaryContext = createContext<Dictionary>({});

export default DictionaryContext;
