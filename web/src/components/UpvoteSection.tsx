import { ApolloCache } from '@apollo/client';
import gql from 'graphql-tag';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import {
  RegularPostFragment,
  useMeQuery,
  useVoteMutation,
  VoteMutation,
} from '../generated/graphql';

interface UpvoteSectionProps {
  post: RegularPostFragment;
}

const updateAfterVote = (
  input: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    let pointsChange;
    let voteCondition;

    if (data.voteStatus === input) {
      pointsChange = -1;
      voteCondition = null;
    } else if (data.voteStatus === -1 * input) {
      pointsChange = 2;
      voteCondition = input;
    } else {
      pointsChange = 1;
      voteCondition = input;
    }

    const newPoints = (data.points as number) + pointsChange * input;

    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: {
        points: newPoints,
        voteStatus: voteCondition,
      },
    });
  }
};

const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const { data: meData } = useMeQuery();
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  const [vote] = useVoteMutation();

  let voteColor;
  switch (post.voteStatus) {
    case 1:
      voteColor = 'orange';
      break;
    case -1:
      voteColor = 'indigo';
      break;
    default:
      voteColor = 'gray';
      break;
  }

  return (
    <div className="flex flex-col items-center justify-around flex-shrink-0 w-8 h-20 mr-4 text-gray-400">
      <button
        onClick={async () => {
          if (!meData?.me?.id) router.push('/login');
          else {
            setLoadingState('upvote-loading');
            await vote({
              variables: {
                postId: post.id,
                input: 1,
              },
              update: (cache) => updateAfterVote(1, post.id, cache),
            });
            setLoadingState('not-loading');
          }
        }}
        disabled={loadingState === 'upvote-loading'}
        aria-label="upvote post"
        className={`rounded-lg transition duration-150 ease-in-out p-1 border border-transparent focus:outline-none focus:shadow-outline-gray ${
          post.voteStatus === 1
            ? `text-white bg-${voteColor}-400 hover:bg-${voteColor}-500 focus:border-${voteColor}-100 active:bg-${voteColor}-500`
            : 'text-black bg-gray-100 hover:bg-gray-200 focus:border-gray-300 active:bg-gray-300'
        }`}
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={`font-bold mx-auto text-lg text-center text-${voteColor}-400`}
      >
        {post.points}
      </div>
      <button
        onClick={async () => {
          if (!meData?.me?.id) router.push('/login');
          else {
            setLoadingState('downvote-loading');
            await vote({
              variables: {
                postId: post.id,
                input: -1,
              },
              update: (cache) => updateAfterVote(-1, post.id, cache),
            });
            setLoadingState('not-loading');
          }
        }}
        disabled={loadingState === 'downvote-loading'}
        aria-label="downvote post"
        className={`rounded-lg transition duration-150 ease-in-out p-1 border border-transparent focus:outline-none focus:shadow-outline-gray ${
          post.voteStatus === -1
            ? `text-white bg-${voteColor}-400 hover:bg-${voteColor}-500 focus:border-${voteColor}-100 active:bg-${voteColor}-500`
            : 'text-black bg-gray-100 hover:bg-gray-200 focus:border-gray-300 active:bg-gray-300'
        }`}
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default UpvoteSection;
