import React from 'react';
import findLink from '../../utils/findLink';

interface ContentLinkProps {
  text: string;
}

const ContentLink: React.FC<ContentLinkProps> = ({ text }) => {
  const linkObj = findLink(text);

  if (linkObj) {
    return (
      <div className="pb-2 truncate">
        <div className="font-medium">Content Link</div>
        <a
          href={linkObj.href}
          className="mt-1 text-teal-500 transition duration-150 ease-in-out hover:text-teal-400 focus:outline-none focus:text-teal-400"
        >
          {linkObj.href}
        </a>
      </div>
    );
  } else {
    return null;
  }
};

export default ContentLink;
