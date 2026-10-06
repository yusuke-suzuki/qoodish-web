import { Cinzel, Lobster, Shippori_Mincho } from 'next/font/google';

const lobster = Lobster({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-lobster',
  display: 'swap'
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cinzel',
  display: 'swap'
});

const shipporiMincho = Shippori_Mincho({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-shippori-mincho',
  display: 'swap',
  preload: false
});

export const fontVariables = `${lobster.variable} ${cinzel.variable} ${shipporiMincho.variable}`;
