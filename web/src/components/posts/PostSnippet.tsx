import Linkify from 'linkifyjs/react';
import Link from 'next/link';
import React from 'react';
import { PostSnippetFragment } from '../../generated/graphql';
import EditDeletePostButtons from './EditDeletePostButtons';
import UpvoteSection from './UpvoteSection';
import TimeAgo from 'react-timeago';

interface PostSnippetProps {
  post: PostSnippetFragment;
}

const PostSnippet: React.FC<PostSnippetProps> = ({ post }) => {
  return (
    <div
      className="flex items-center w-full px-4 py-4 mx-auto border rounded shadow-md"
      key={post.id}
    >
      <UpvoteSection post={post} />
      <section className="flex items-center justify-between flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <h1>
            <Link href="/post/[id]" as={`/post/${post.id}`}>
              <a className="text-xl font-bold text-gray-600 transition duration-150 ease-in-out hover:text-black focus:outline-none focus:text-black">
                {post.title}
              </a>
            </Link>
          </h1>
          <p className="text-xs text-gray-400">
            posted by {post.creator.username}
            {' · '}
            <TimeAgo date={Number(post.createdAt)} />
            {post.createdAt !== post.updatedAt ? (
              <span>
                {' · edited '}
                <TimeAgo date={Number(post.updatedAt)} />
              </span>
            ) : null}
          </p>
          <p className="max-w-xl mt-2 text-sm text-gray-600 truncate">
            <Linkify
              options={{
                className:
                  'text-teal-500 transition duration-150 ease-in-out hover:text-teal-400',
              }}
            >
              {post.textSnippet}
            </Linkify>
          </p>
          <div className="mt-1">
            <Link href="/post/[id]" as={`/post/${post.id}`}>
              <a className="text-xs text-gray-400 transition duration-150 ease-in-out hover:text-gray-600 focus:outline-none focus:text-gray-600">
                {post.commentCount}
                {post.commentCount === 1 ? ' comment' : ' comments'}
              </a>
            </Link>
          </div>
        </div>
        <div className="flex-shrink-0">
          <EditDeletePostButtons id={post.id} creatorId={post.creator.id} />
        </div>
      </section>
    </div>
  );
};

export default PostSnippet;
