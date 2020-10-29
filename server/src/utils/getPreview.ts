const linkPreviewGenerator = require('link-preview-generator');
const linkify = require('linkifyjs');
// const axios = require('axios');

const getPreview = async (text: string): Promise<string | null> => {
  console.log('getPreview entered');
  const firstLink = linkify.find(text, 'url')[0].href;

  // const urlMetaAuth = `${process.env.URL_META_EMAIL}:${process.env.URL_META_KEY}`;
  // const buff = Buffer.from(urlMetaAuth).toString('base64');
  // const config = {
  //   headers: {
  //     authorization: `Basic ${buff}`,
  //     'Access-Control-Allow-Origin': '*',
  //   },
  // };

  // try {

  // } catch (error) {

  // }

  try {
    console.log('getPreview run branch entered');
    const linkPreview = await linkPreviewGenerator(firstLink, [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ]);
    console.log('linkPreview:' + JSON.stringify(linkPreview));
    return JSON.stringify(linkPreview);
  } catch (error) {
    console.log('linkPreview error:' + error);
    console.log('linkPreview errormsg:' + error.message);
    return null;
  }
};

export default getPreview;
