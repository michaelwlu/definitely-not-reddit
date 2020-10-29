import isImageUrl from 'is-image-url';
import isVideo from 'is-video';
import Linkify from 'linkifyjs/react';
import React from 'react';
import ReactPlayer from 'react-player/lazy';
import findLink from '../../utils/findLink';
import LinkPreview from './LinkPreview';

interface PostBodyProps {
  text: string;
  id: number;
  isSnippet?: boolean;
}

const PostBody: React.FC<PostBodyProps> = ({ text, id, isSnippet = false }) => {
  // find first valid link in text
  const featuredLink = findLink(text);

  // if no links found, early return text element
  if (!featuredLink) {
    return (
      <div
        className={`${
          isSnippet ? 'text-sm truncate mb-2' : 'mb-4'
        } break-words mt-3`}
      >
        {text}
      </div>
    );
  }

  // destructure link to get both value (original string e.g. google.com) and href (e.g. https://www.google.com)
  const { value, href } = featuredLink;

  // compare text with value and href to determine if text is just a link
  const isOnlyLink = value === text || href === text;

  // trim link from text if 1) the link is either at the beginning or the end of the text and 2) is a complete href
  const removeLink = text.trim().startsWith(href) || text.trim().endsWith(href);

  // escape special characters in href for regex
  const escapedHref = href.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const replaceRegex = new RegExp(escapedHref, 'gi');
  const replacedText = text.replace(replaceRegex, '');

  // build text body depending on whether text is only link and - otherwise - whether to trim link
  const textBody = (
    <div
      className={`${
        isSnippet ? 'text-sm truncate mb-2' : 'mb-4'
      } break-words overflow-hidden`}
    >
      <Linkify
        options={{
          className:
            'text-teal-500 transition duration-150 ease-in-out hover:text-teal-400',
          attributes: {
            rel: 'noopener',
          },
        }}
      >
        {removeLink ? replacedText : text}
      </Linkify>
    </div>
  );

  // format featured link with icon
  const formattedLink = (
    <div className="inline-block mb-2 break-all">
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="text-sm text-teal-500 transition duration-150 ease-in-out hover:text-teal-400"
      >
        {href}
        <svg
          className="inline-block w-4 h-4 mb-0.5 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );

  let body = null;

  // build image element
  if (isImageUrl(href)) {
    body = <img src={href} className="max-w-full max-h-96" />;

    // build video file element
  } else if (isVideo(href)) {
    body = (
      <>
        <div className="block sm:hidden">
          <video controls muted className="max-w-full max-h-96">
            <source src={href} />
          </video>
        </div>
        <div className="hidden sm:block">
          <video controls autoPlay muted className="max-w-full max-h-96">
            <source src={href} />
          </video>
        </div>
      </>
    );

    // build react player post
  } else if (ReactPlayer.canPlay(href)) {
    body = <ReactPlayer url={href} controls width="100%" />;

    // attempt to get link preview
  } else {
    body = (
      <div className="mb-2 break-words">
        <LinkPreview id={id} href={href} isSnippet={isSnippet} />
      </div>
    );
  }

  return (
    <>
      {isSnippet ? (
        <div className="mt-3">
          {isOnlyLink ? null : textBody}
          {body}
        </div>
      ) : (
        <div className="mt-2 -ml-9 sm:pt-0 sm:ml-0">
          {isOnlyLink ? null : textBody}
          {formattedLink}
          {body}
        </div>
      )}
    </>
  );
};

export default PostBody;
