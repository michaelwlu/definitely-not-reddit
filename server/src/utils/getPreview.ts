const linkPreviewGenerator = require('link-preview-generator');
const linkify = require('linkifyjs');

const getPreview = async (text: string): Promise<string | null> => {
  const firstLink = linkify.find(text, 'url')[0].href;
  try {
    const linkPreview = await linkPreviewGenerator(firstLink);
    return JSON.stringify(linkPreview);
  } catch {
    () => {
      return null;
    };
  }
  return null;
};

export default getPreview;
