import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import url from 'url';

const staticFileExtensions = [
  'ai',
  'avi',
  'css',
  'dat',
  'dmg',
  'doc',
  'doc',
  'exe',
  'flv',
  'gif',
  'ico',
  'iso',
  'jpeg',
  'jpg',
  'js',
  'less',
  'm4a',
  'm4v',
  'mov',
  'mp3',
  'mp4',
  'mpeg',
  'mpg',
  'pdf',
  'png',
  'ppt',
  'psd',
  'rar',
  'rss',
  'svg',
  'swf',
  'tif',
  'torrent',
  'ttf',
  'txt',
  'wav',
  'wmv',
  'woff',
  'xls',
  'xml',
  'zip'
];

export async function middleware(req: NextRequest, _ev: NextFetchEvent) {
  console.log(`[Middleware] URL: ${req.nextUrl.href}`);

  if (!req.ua || !req.ua.isBot) {
    return NextResponse.next();
  }

  const excludeUrlPattern = new RegExp(
    `\\.(${staticFileExtensions.join('|')})$`,
    'i'
  );

  const isIgnorePath = excludeUrlPattern.test(req.nextUrl.pathname);

  if (isIgnorePath) {
    return NextResponse.next();
  }

  console.log(`[Middleware] Bot access: ${req.ua.ua}`);

  const originalUrl = url.format({
    protocol: 'https',
    host: process.env.SITE_DOMAIN,
    pathname: req.nextUrl.pathname,
    search: req.nextUrl.search
  });

  const response = await fetch(
    `${process.env.RENDERTRON_ENDPOINT}/render/${encodeURIComponent(
      originalUrl
    )}?mobile=true`
  );
  console.log('Rendertron response:', response);
  const body = await response.text();

  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8'
  });

  return new Response(body, {
    status: 200,
    headers: headers
  });
}
