import linkPreviewGenerator from 'link-preview-generator';

const linkPreviewGen = async (url: string): Promise<string> => {
  const linkPreview = await linkPreviewGenerator(url, [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
  ]);

  return JSON.stringify(linkPreview);
};

export default linkPreviewGen;
