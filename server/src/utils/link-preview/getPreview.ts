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

const getPreview = async (url: string): Promise<LinkPreview | null> => {
  const isUrlValid = await checkUrl(url);
  if (!isUrlValid) {
    console.log('not valid URL');
    return null;
  }

  const errorLog = {
    linkPreviewGen: '',
    urlMeta: '',
    linkPreviewNet: '',
  };

  try {
    const linkPreviewGenRes = await linkPreviewGen(url);
    // console.log('linkPreviewGenString: ' + JSON.stringify(linkPreviewGenRes));
    return linkPreviewGenRes;
  } catch (error) {
    errorLog.linkPreviewGen = error;
  }

  try {
    const linkPreviewNetRes = await linkPreviewNet(url);
    // console.log('linkPreviewNetString: ' + JSON.stringify(linkPreviewNetRes));
    return linkPreviewNetRes;
  } catch (error) {
    errorLog.linkPreviewNet = error;
  }

  try {
    const urlMetaRes = await urlMeta(url);
    // console.log('urlMetaString: ' + JSON.stringify(urlMetaRes));
    return urlMetaRes;
  } catch (error) {
    errorLog.urlMeta = error;
  }

  console.log(errorLog);
  return null;
};

export default getPreview;
