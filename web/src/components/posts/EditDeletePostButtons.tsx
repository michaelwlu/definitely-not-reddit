import Link from 'next/link';
import { Router, useRouter } from 'next/router';
import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../../generated/graphql';

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const { data: meData } = useMeQuery();
  const router = useRouter();
  const [deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId && meData?.me?.username !== 'admin') {
    return null;
  }

  return (
    <div className="flex space-x-1">
      <Link href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <button
          className="p-1 text-gray-400 transition duration-150 ease-in-out bg-gray-200 border border-transparent rounded-lg focus:outline-none hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-300 hover:text-gray-600"
          aria-label="Edit Post"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </Link>
      <button
        className="p-1 text-gray-400 transition duration-150 ease-in-out bg-gray-200 border border-transparent rounded-lg focus:outline-none hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-300 hover:text-gray-600"
        aria-label="Delete Post"
        onClick={() => {
          let deleteSuccess = confirm(
            'Are you sure you would like to delete this post?'
          )
            ? deletePost({
                variables: { id },
                update: (cache) => {
                  cache.evict({ fieldName: 'posts:{}' });
                },
              })
            : null;
          if (deleteSuccess) router.push('/');
        }}
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default EditDeletePostButtons;
