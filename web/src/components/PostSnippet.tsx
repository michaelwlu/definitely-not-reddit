import { Box, Flex, Heading, Link, Text } from '@chakra-ui/core';
import NextLink from 'next/link';
import React from 'react';
import { PostSnippetFragment } from '../generated/graphql';
import EditDeletePostButtons from './EditDeletePostButtons';
import UpvoteSection from './UpvoteSection';

interface PostSnippetProps {
  post: PostSnippetFragment;
}

const PostSnippet: React.FC<PostSnippetProps> = ({ post }) => {
  return (
    <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
      <UpvoteSection post={post} />
      <Box flex={1}>
        <NextLink href="/post/[id]" as={`/post/${post.id}`}>
          <Link>
            <Heading fontSize="xl">{post.title}</Heading>
          </Link>
        </NextLink>
        <Text fontSize="sm" textColor="gray.500">
          submitted by{' '}
          <Text as="span" textColor="gray.700">
            {post.creator.username}
          </Text>
        </Text>
        <Flex align="center">
          <Text flex={1} mt={4}>
            {post.textSnippet}
          </Text>
          <EditDeletePostButtons id={post.id} creatorId={post.creator.id} />
        </Flex>
      </Box>
    </Flex>
  );
};

export default PostSnippet;
