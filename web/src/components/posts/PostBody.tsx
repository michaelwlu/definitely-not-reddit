import Linkify from 'linkifyjs/react';
import React from 'react';
import ReactPlayer from 'react-player/lazy';
import { RegularPostFragment } from '../../generated/graphql';
import LinkPreview from './LinkPreview';

interface PostBodyProps {
  post: RegularPostFragment;
  isSnippet?: boolean;
}

const PostBody: React.FC<PostBodyProps> = ({ post, isSnippet = false }) => {
  // if no link, early return text element
  const { text, link } = post;

  if (!link) {
    return (
      <div
        className={`${
          isSnippet ? 'text-sm truncate mb-2 h-6' : 'mb-4'
        } break-words mt-3 whitespace-pre-line`}
      >
        {text}
      </div>
    );
  }

  // destructure link elements
  const { linkText, url, type } = link;

  // compare text with value and href to determine if text is just a link
  const isOnlyLink = linkText === text || url === text;

  // trim link from text if 1) the link is either at the beginning or the end of the text and 2) is a complete href
  const removeLink = text.trim().startsWith(url) || text.trim().endsWith(url);

  // escape special characters in href for regex
  const escapedHref = url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const replaceRegex = new RegExp(escapedHref, 'gi');
  const replacedText = text.replace(replaceRegex, '');

  // build text body depending on whether text is only link and - otherwise - whether to trim link
  const textBody = (
    <div
      className={`${
        isSnippet ? 'text-sm truncate h-6 mb-2' : 'mb-4'
      } break-words overflow-hidden whitespace-pre-line`}
    >
      <Linkify
        options={{
          className:
            'text-teal-500 transition duration-150 ease-in-out hover:text-teal-400 focus:text-teal-400 focus:outline-none',
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
        href={url}
        target="_blank"
        rel="noopener"
        className="text-sm text-teal-500 transition duration-150 ease-in-out hover:text-teal-400 focus:text-teal-400 focus:outline-none"
      >
        {url}
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

  switch (type) {
    case 'image':
      body = <img src={url} className="max-w-full max-h-96" />;
      break;

    case 'video':
      body = (
        <div className="block">
          <video
            controls
            muted
            autoPlay
            loop
            playsInline
            className="max-w-full max-h-96"
          >
            <source src={url} />
          </video>
        </div>
      );
      break;

    case 'player':
      body = <ReactPlayer url={url} controls width="100%" />;
      break;

    default:
      body = (
        <div className="mb-2 break-words">
          <LinkPreview link={link} isSnippet={isSnippet} />
        </div>
      );
      break;
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
