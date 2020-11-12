import React from 'react';
import Truncate from 'react-truncate';
import { RegularLinkFragment } from '../../generated/graphql';

interface LinkPreviewProps {
  link: RegularLinkFragment;
  isSnippet?: boolean;
}
const LinkPreview: React.FC<LinkPreviewProps> = ({
  link,
  isSnippet = false,
}) => {
  const { url, name, description, domain, image } = link;
  return (
    <a
      href={url}
      className={`${
        isSnippet ? 'h-64 sm:h-36' : 'sm:h-48'
      } flex flex-col justify-end max-w-full overflow-hidden bg-white border rounded-lg shadow-sm sm:flex-row group focus:shadow-md focus:outline-none`}
    >
      <div
        className={`${
          isSnippet ? 'h-full max-h-44 sm:w-1/4' : 'h-52 sm:w-1/3'
        } flex-shrink flex w-full sm:h-full`}
      >
        <img
          src={image!}
          className="block object-cover object-center w-full h-full"
        />
      </div>
      <div
        className={`${
          isSnippet ? 'sm:w-3/4' : 'sm:w-2/3'
        } flex flex-col justify-center flex-shrink-0 w-full h-auto px-4 py-4 overflow-hidden border-t sm:px-6 sm:h-full sm:border-l sm:border-t-0`}
      >
        {isSnippet ? (
          <>
            <h3 className="text-sm font-semibold transition duration-150 ease-in-out group-hover:text-teal-500">
              <Truncate lines={2}>{name}</Truncate>
            </h3>
            <div className="hidden mt-2 text-xs truncate sm:block sm:text-sm">
              {description}
            </div>
          </>
        ) : (
          <>
            <div className="font-semibold transition duration-150 ease-in-out group-hover:text-teal-500">
              <h3 className="hidden text-lg sm:block">
                <Truncate lines={2}>{name}</Truncate>
              </h3>
              <h3 className="block text-base sm:hidden">
                <Truncate lines={3}>{name}</Truncate>
              </h3>
            </div>
            <div className="hidden mt-2 text-sm sm:block">
              <Truncate lines={3} trimWhitespace>
                {description}
              </Truncate>
            </div>
            <div className="block mt-2 text-xs sm:hidden">
              <Truncate lines={2} trimWhitespace>
                {description}
              </Truncate>
            </div>
          </>
        )}
        <p className="mt-2 text-xs text-gray-400 truncate sm:text-sm">
          {domain}
        </p>
      </div>
    </a>
  );

  // const siteUrlCore = new URL(process.env.NEXT_PUBLIC_WEB_URL).hostname;
  // const hrefUrlCore = new URL(href).hostname;

  // if (siteUrlCore === hrefUrlCore) {
  //   return body({
  //     title: defaultInfo.site,
  //     description: defaultInfo.desc,
  //     domain: siteUrlCore.replace('www.', ''),
  //     img: `${defaultInfo.url}/${defaultInfo.img}`,
  //   });
  // }

  //  if (loading) {
  //   return (
  //     <div
  //       className={`${
  //         isSnippet ? 'h-64 sm:h-36' : 'sm:h-48'
  //       } animate-pulse flex flex-col justify-end max-w-full overflow-hidden border border-gray-200 rounded-lg shadow-sm sm:flex-row`}
  //     >
  //       <div
  //         className={`${
  //           isSnippet ? 'h-full max-h-44 sm:w-1/4' : 'h-52 sm:w-1/3'
  //         } bg-gray-200 flex-shrink flex w-full sm:h-full`}
  //       ></div>
  //       <div
  //         className={`${
  //           isSnippet ? 'sm:w-3/4' : 'sm:w-2/3'
  //         } flex flex-col justify-center flex-shrink-0 w-full h-auto px-4 py-4 overflow-hidden bg-white border-t border-gray-200 sm:px-6 sm:h-full sm:border-l sm:border-t-0`}
  //       >
  //         <TextBlock rows={3} color="#e5e7eb" />
  //       </div>
  //     </div>
  //   );
  // }

  // const errorDisplay = (
  //   <div className="text-sm italic text-gray-400">{`< No link preview available >`}</div>
  // );

  // if (error) {
  //   return errorDisplay;
  // }

  // if (!data?.post?.linkPreview) {
  //   return errorDisplay;
  // }

  // const linkPreviewObj = JSON.parse(data.post.linkPreview);

  // return body(linkPreviewObj);
};

export default LinkPreview;
