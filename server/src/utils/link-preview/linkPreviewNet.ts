import axios from 'axios';
import { LinkPreview } from './getPreview';

const linkPreviewNet = async (url: string): Promise<LinkPreview> => {
  const config = {
    // these have to be query params: axios drops `data` on a GET, so the
    // request went out with no key at all and always came back 403
    params: {
      key: process.env.LINK_PREVIEW_KEY,
      q: url,
    },
    timeout: 5000,
  };

  const linkPreviewNetRes = await axios.get(
    'https://api.linkpreview.net/',
    config
  );

  if (linkPreviewNetRes.status !== 200)
    throw new Error('Link Preview Net response error');

  const { title, description, image, url: domain } = linkPreviewNetRes.data;

  const linkPreviewNetObj = {
    name: title || '',
    description: description || '',
    image: image || '',
    domain: domain ? new URL(domain).hostname.replace('www.', '') : '',
  };

  return linkPreviewNetObj;
};

export default linkPreviewNet;
