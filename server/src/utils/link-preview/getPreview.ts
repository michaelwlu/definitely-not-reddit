import * as linkify from 'linkifyjs';
import checkUrl from './checkUrl';
import linkPreviewGen from './linkPreviewGen';
import linkPreviewNet from './linkPreviewNet';
import urlMeta from './urlMeta';

const getPreview = async (text: string): Promise<string | null> => {
  const firstLink = linkify.find(text, 'url')[0].href;
  const isUrlValid = await checkUrl(firstLink);
  if (!isUrlValid) return null;

  const errorLog = {
    linkPreviewGen: '',
    urlMeta: '',
    linkPreviewNet: '',
  };

  try {
    const linkPreviewGenRes = await linkPreviewGen(firstLink);
    // console.log('linkPreviewGenString: ' + linkPreviewGenRes);
    return linkPreviewGenRes;
  } catch (error) {
    errorLog.linkPreviewGen = error;
  }

  try {
    const urlMetaRes = await urlMeta(firstLink);
    // console.log('urlMetaString: ' + urlMetaRes);
    return urlMetaRes;
  } catch (error) {
    errorLog.urlMeta = error;
  }

  try {
    const linkPreviewNetRes = await linkPreviewNet(firstLink);
    // console.log('linkPreviewNetString: ' + linkPreviewNetRes);
    return linkPreviewNetRes;
  } catch (error) {
    errorLog.linkPreviewNet = error;
  }

  console.log(errorLog);
  return null;
};

export default getPreview;
