import Linkify from 'linkifyjs/react';
import Link from 'next/link';
import React from 'react';
import { PostSnippetFragment } from '../generated/graphql';
import EditDeletePostButtons from './EditDeletePostButtons';
import UpvoteSection from './UpvoteSection';

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
              <a className="text-xl font-bold text-gray-600 transition duration-150 ease-in-out hover:text-black">
                {post.title}
              </a>
            </Link>
          </h1>
          <p className="text-xs text-gray-400">
            submitted by {post.creator.username}
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
        </div>
        <div className="flex-shrink-0">
          <EditDeletePostButtons id={post.id} creatorId={post.creator.id} />
        </div>
      </section>
    </div>
  );
};

export default PostSnippet;
