import * as linkify from 'linkifyjs';

const findLink = (text: string): linkify.FindResultHash | null => {
  const links = linkify.find(text, 'url');
  if (!links.length) {
    return null;
  }

  return links[0];
};

export default findLink;
