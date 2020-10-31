import axios from 'axios';

const urlMeta = async (url: string): Promise<string> => {
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
    title: metaInfo.title || '',
    description: metaInfo.description || '',
    img: metaInfo.image || '',
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

  return JSON.stringify(metaObj);
};

export default urlMeta;
