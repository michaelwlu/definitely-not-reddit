import linkPreviewGenerator from 'link-preview-generator';
import { LinkPreview } from './getPreview';

const linkPreviewGen = async (url: string): Promise<LinkPreview> => {
  const gen = await linkPreviewGenerator(url, [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
  ]);

  const genObj = {
    name: gen.title || '',
    description: gen.description || '',
    image: gen.img || '',
    domain: gen.domain || '',
  };

  return genObj;
};

export default linkPreviewGen;
