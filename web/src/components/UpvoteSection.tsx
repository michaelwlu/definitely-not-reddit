import { ApolloCache } from '@apollo/client';
import { Box, Flex, IconButton } from '@chakra-ui/core';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
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
      voteColor = 'upvote.500';
      break;
    case -1:
      voteColor = 'downvote.500';
      break;
    default:
      voteColor = 'gray.500';
      break;
  }

  return (
    <Flex
      direction="column"
      justify="space-around"
      align="center"
      mr={4}
      h={20}
      w={8}
    >
      <IconButton
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
        colorScheme={post.voteStatus === 1 ? 'upvote' : undefined}
        size="xs"
        isLoading={loadingState === 'upvote-loading'}
        aria-label="upvote post"
        icon={<ChevronUpIcon />}
      />
      <Box fontWeight="bold" textColor={voteColor} fontSize="lg">
        {post.points}
      </Box>
      <IconButton
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
        colorScheme={post.voteStatus === -1 ? 'downvote' : undefined}
        size="xs"
        isLoading={loadingState === 'downvote-loading'}
        aria-label="downvote post"
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};

export default UpvoteSection;
