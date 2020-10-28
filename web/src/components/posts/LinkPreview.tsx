import React, { useEffect, useState } from 'react';
import Truncate from 'react-truncate';
import { useLinkPreviewQuery } from '../../generated/graphql';
import LoadingSpinner from '../misc/LoadingSpinner';
import ReactPlaceholder from 'react-placeholder';
import { TextBlock } from 'react-placeholder/lib/placeholders';
// import 'react-placeholder/lib/reactPlaceholder.css';

interface LinkPreviewProps {
  id: number;
  href: string;
  isSnippet?: boolean;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({
  id,
  href,
  isSnippet = false,
}) => {
  const { data, error, loading } = useLinkPreviewQuery({
    variables: { id },
  });

  if (loading) {
    return (
      <div
        className={`${
          isSnippet ? 'h-64 sm:h-36' : 'sm:h-48'
        } animate-pulse flex flex-col justify-end max-w-full overflow-hidden border border-gray-200 rounded-lg shadow-sm sm:flex-row`}
      >
        <div
          className={`${
            isSnippet ? 'h-full max-h-44' : 'h-52'
          } bg-gray-200 flex-shrink flex w-full sm:w-1/4 sm:h-full`}
        ></div>
        <div className="flex flex-col justify-center flex-shrink-0 w-full h-auto px-4 py-4 overflow-hidden bg-white border-t border-gray-200 sm:px-6 sm:h-full sm:w-3/4 sm:border-l sm:border-t-0">
          <TextBlock rows={3} color="#e5e7eb" />
        </div>
      </div>
    );
  }
  if (error) {
    return null;
  }

  if (!data?.post?.linkPreview) {
    return null;
  }

  let preview;
  if (data?.post?.linkPreview) {
    preview = JSON.parse(data.post.linkPreview);
  }

  return (
    <a
      href={href}
      className={`${
        isSnippet ? 'h-64 sm:h-36' : 'sm:h-48'
      } flex flex-col justify-end max-w-full overflow-hidden bg-white border rounded-lg shadow-sm sm:flex-row`}
    >
      <div
        className={`${
          isSnippet ? 'h-full max-h-44' : 'h-52'
        } flex-shrink flex w-full sm:w-1/4 sm:h-full`}
      >
        <img
          src={preview.img}
          className="block object-cover object-center w-full h-full"
        />
      </div>
      <div className="flex flex-col justify-center flex-shrink-0 w-full h-auto px-4 py-4 overflow-hidden border-t sm:px-6 sm:h-full sm:w-3/4 sm:border-l sm:border-t-0">
        {isSnippet ? (
          <>
            <h3 className="text-sm font-semibold">
              <Truncate lines={2}>{preview.title}</Truncate>
            </h3>
            <div className="hidden mt-2 text-xs truncate sm:block sm:text-sm">
              {preview.description}
            </div>
          </>
        ) : (
          <>
            <h3 className="hidden text-lg font-semibold sm:block">
              <Truncate lines={2}>{preview.title}</Truncate>
            </h3>
            <h3 className="block text-base font-semibold sm:hidden">
              <Truncate lines={3}>{preview.title}</Truncate>
            </h3>
            <div className="hidden mt-2 text-sm sm:block">
              <Truncate lines={3} trimWhitespace>
                {preview.description}
              </Truncate>
            </div>
            <div className="block mt-2 text-xs sm:hidden">
              <Truncate lines={2} trimWhitespace>
                {preview.description}
              </Truncate>
            </div>
          </>
        )}
        <p className="mt-2 text-xs text-gray-400 truncate sm:text-sm">
          {preview.domain}
        </p>
      </div>
    </a>
  );
};

export default LinkPreview;
