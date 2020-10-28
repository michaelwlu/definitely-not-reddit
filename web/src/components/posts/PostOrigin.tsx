import React from 'react';
import { RegularPostFragment } from '../../generated/graphql';
import TimeAgo from '../misc/TimeAgo';
import EditDeletePostButtons from './EditDeletePostButtons';

interface PostOriginProps {
  post: RegularPostFragment;
}

const PostOrigin: React.FC<PostOriginProps> = ({ post }) => {
  return (
    <div className="flex items-center justify-between text-sm sm:justify-start">
      <div className="mr-4 text-sm text-gray-400">
        posted by{' '}
        <div className="inline font-medium text-orange-500 text-opacity-75 break-all">
          {post.creator.username}
        </div>
        <TimeAgo createdAt={post.createdAt} updatedAt={post.updatedAt} />
      </div>
      <EditDeletePostButtons id={post.id} creatorId={post.creator.id} />
    </div>
  );
};

export default PostOrigin;
