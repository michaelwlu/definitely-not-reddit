import isImageUrl from 'is-image-url';
import isVideo from 'is-video';
import ReactPlayer from 'react-player/lazy';
import { LinkType } from '../entities/Link';

const classifyLink = (url: string): LinkType => {
  if (isImageUrl(url)) {
    return 'image';
  } else if (isVideo(url)) {
    return 'video';
  } else if (ReactPlayer.canPlay(url)) {
    return 'player';
  } else {
    return 'website';
  }
};

export default classifyLink;
