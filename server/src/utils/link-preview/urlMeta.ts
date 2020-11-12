import axios from 'axios';
import { LinkPreview } from './getPreview';

const urlMeta = async (url: string): Promise<LinkPreview> => {
  const auth = `${process.env.URL_META_EMAIL}:${process.env.URL_META_KEY}`;
  const encodedAuth = Buffer.from(auth).toString('base64');

  const config = {
    headers: {
      authorization: `Basic ${encodedAuth}`,
    },
    timeout: 5000,
  };

  const metaRes = await axios.get(
    `https://api.urlmeta.org/?url=${encodeURIComponent(url)}`,
    config
  );

  if (metaRes.status !== 200) throw new Error('response error');
  if (metaRes.data.result.status !== 'OK')
    throw new Error(metaRes.data.result.reason);

  const metaInfo = metaRes.data.meta;

  const metaObj = {
    name: metaInfo.title || '',
    description: metaInfo.description || '',
    image:
      (metaInfo.image[0] === '/' ? url + metaInfo.image : metaInfo.image) || '',
    domain: new URL(url).hostname.replace('www.', ''),
  };

  if (metaInfo.site.canonical) {
    if (metaInfo.site.canonical.length > 1) {
      metaObj.domain = new URL(metaInfo.site.canonical).hostname.replace(
        'www.',
        ''
      );
    }
  }

  return metaObj;
};

export default urlMeta;
