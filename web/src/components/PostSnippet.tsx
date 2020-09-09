import { Box, Flex, Heading, IconButton, Link, Text } from '@chakra-ui/core';
import NextLink from 'next/link';
import React from 'react';
import { PostSnippetFragment } from '../generated/graphql';
import UpvoteSection from './UpvoteSection';

interface PostSnippetProps {
  post: PostSnippetFragment;
}

const PostSnippet: React.FC<PostSnippetProps> = ({ post }) => {
  return (
    <Flex p={5} shadow="md" borderWidth="1px">
      <UpvoteSection post={post} />
      <Box flex={1}>
        <NextLink href="/post/[id]" as={`/post/${post.id}`}>
          <Link>
            <Heading fontSize="xl">{post.title}</Heading>
          </Link>
        </NextLink>
        <Text>posted by {post.creator.username}</Text>
        <Flex align="center">
          <Text flex={1} mt={4}>
            {post.textSnippet}
          </Text>
          <IconButton
            icon="delete"
            aria-label="delete post"
            onClick={() => {}}
          />
        </Flex>
      </Box>
    </Flex>
  );
};

export default PostSnippet;
