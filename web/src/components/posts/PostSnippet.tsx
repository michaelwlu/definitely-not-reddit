import Link from 'next/link';
import React from 'react';
import TimeAgo from 'react-timeago';
import { RegularPostFragment } from '../../generated/graphql';
import EditDeletePostButtons from './EditDeletePostButtons';
import PostBody from './PostBody';
import PostOrigin from './PostOrigin';
import UpvoteSection from './UpvoteSection';

interface PostSnippetProps {
  post: RegularPostFragment;
}

const PostSnippet: React.FC<PostSnippetProps> = ({ post }) => {
  return (
    <div
      className="flex items-start w-full py-5 pl-3 pr-4 mx-auto bg-white border-t border-b sm:border sm:shadow-md sm:rounded-lg sm:py-4 sm:pl-4 sm:pr-6"
      key={post.id}
    >
      <div className="mt-1">
        <UpvoteSection post={post} />
      </div>
      <section className="flex items-start justify-between flex-1 min-w-0 ml-3 sm:ml-5">
        <div className="flex-1 min-w-0">
          <h1 className="mb-1 leading-6 break-words">
            <Link href="/post/[id]" as={`/post/${post.id}`}>
              <a className="text-xl font-bold text-gray-600 transition duration-150 ease-in-out hover:text-black focus:outline-none focus:text-black">
                {post.title}
              </a>
            </Link>
          </h1>
          <PostOrigin post={post} />
          <div>
            <PostBody text={post.text} id={post.id} isSnippet={true} />
          </div>
          <div className="flex items-center mt-2 flex-start">
            <Link href="/post/[id]" as={`/post/${post.id}`}>
              <a className="text-sm text-gray-400 transition duration-150 ease-in-out hover:text-gray-600 focus:outline-none focus:text-gray-600">
                <svg
                  className="inline-block w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span>
                  {post.commentCount}
                  <span className="hidden sm:inline">
                    {post.commentCount === 1 ? ' comment' : ' comments'}
                  </span>
                </span>
              </a>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostSnippet;
