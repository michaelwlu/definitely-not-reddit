import { ApolloCache } from '@apollo/client';
import gql from 'graphql-tag';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import {
  RegularPostFragment,
  useMeQuery,
  useVoteMutation,
  VoteMutation,
} from '../../generated/graphql';

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
    <div className="flex flex-col items-center justify-around flex-shrink-0 w-8 h-20 text-gray-400">
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
            : 'text-gray-500 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 focus:border-gray-300 active:bg-gray-300'
        }`}
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 444.819 444.819"
          fill="currentColor"
          width="0.65rem"
          height="0.65rem"
        >
          <g>
            <path
              d="M433.968,278.657L248.387,92.79c-7.419-7.044-16.08-10.566-25.977-10.566c-10.088,0-18.652,3.521-25.697,10.566
			 L10.848,278.657C3.615,285.887,0,294.549,0,304.637c0,10.28,3.619,18.843,10.848,25.693l21.411,21.413
			 c6.854,7.23,15.42,10.852,25.697,10.852c10.278,0,18.842-3.621,25.697-10.852L222.41,213.271L361.168,351.74
			 c6.848,7.228,15.413,10.852,25.7,10.852c10.082,0,18.747-3.624,25.975-10.852l21.409-21.412
			 c7.043-7.043,10.567-15.608,10.567-25.693C444.819,294.545,441.205,285.884,433.968,278.657z"
            />
          </g>
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
            : 'text-gray-500 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 focus:border-gray-300 active:bg-gray-300'
        }`}
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 444.819 444.819"
          width="0.65rem"
          height="0.65rem"
          fill="currentColor"
        >
          <g>
            <path
              d="M434.252,114.203l-21.409-21.416c-7.419-7.04-16.084-10.561-25.975-10.561c-10.095,0-18.657,3.521-25.7,10.561
		L222.41,231.549L83.653,92.791c-7.042-7.04-15.606-10.561-25.697-10.561c-9.896,0-18.559,3.521-25.979,10.561l-21.128,21.416
		C3.615,121.436,0,130.099,0,140.188c0,10.277,3.619,18.842,10.848,25.693l185.864,185.865c6.855,7.23,15.416,10.848,25.697,10.848
		c10.088,0,18.75-3.617,25.977-10.848l185.865-185.865c7.043-7.044,10.567-15.608,10.567-25.693
		C444.819,130.287,441.295,121.629,434.252,114.203z"
            />
          </g>
        </svg>
      </button>
    </div>
  );
};

export default UpvoteSection;
