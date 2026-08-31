import checkUrl from './checkUrl';
import linkPreviewGen from './linkPreviewGen';
import linkPreviewNet from './linkPreviewNet';
import urlMeta from './urlMeta';

export interface LinkPreview {
  name: string;
  description: string;
  domain: string;
  image: string;
}

// A provider can resolve with every field blank. That is a miss, not a hit, and
// should fall through to the next provider instead of short-circuiting the chain.
const hasContent = (preview: LinkPreview) =>
  Boolean(preview.name || preview.description || preview.image);

// linkPreviewGen is last because it launches a headless Chromium, which costs
// hundreds of MB. It still earns its place at the end: it is the only provider
// that gets metadata out of pages that block bots or disallow crawling.
const providers = [
  { name: 'linkPreviewNet', run: linkPreviewNet },
  { name: 'urlMeta', run: urlMeta },
  { name: 'linkPreviewGen', run: linkPreviewGen },
];

const getPreview = async (url: string): Promise<LinkPreview | null> => {
  const isUrlValid = await checkUrl(url);
  if (!isUrlValid) {
    console.log('not valid URL');
    return null;
  }

  const errorLog: Record<string, string> = {};

  for (const provider of providers) {
    try {
      const preview = await provider.run(url);
      if (hasContent(preview)) {
        return preview;
      }
      errorLog[provider.name] = 'no metadata found';
    } catch (error) {
      errorLog[provider.name] = `${error}`;
    }
  }

  console.log(errorLog);
  return null;
};

export default getPreview;
