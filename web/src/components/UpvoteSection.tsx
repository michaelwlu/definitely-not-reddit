import { Flex, IconButton } from '@chakra-ui/core';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpvoteSectionProps {
  post: PostSnippetFragment;
}

const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'upvote-loading' | 'downvote-loading' | 'not-loading'
  >('not-loading');
  const [{}, vote] = useVoteMutation();
  return (
    <Flex direction="column" justify="center" align="center" mr={4}>
      <IconButton
        onClick={async () => {
          setLoadingState('upvote-loading');
          await vote({
            postId: post.id,
            input: 1,
          });
          setLoadingState('not-loading');
        }}
        variantColor={post.voteStatus === 1 ? 'green' : undefined}
        isLoading={loadingState === 'upvote-loading'}
        aria-label="upvote post"
        icon="chevron-up"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          setLoadingState('downvote-loading');
          await vote({
            postId: post.id,
            input: -1,
          });
          setLoadingState('not-loading');
        }}
        variantColor={post.voteStatus === -1 ? 'red' : undefined}
        isLoading={loadingState === 'downvote-loading'}
        aria-label="downvote post"
        icon="chevron-down"
      />
    </Flex>
  );
};

export default UpvoteSection;
