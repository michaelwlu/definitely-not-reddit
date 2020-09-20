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
    <Flex
      key={post.id}
      align="center"
      px={5}
      py={4}
      shadow="md"
      borderWidth="1px"
    >
      <UpvoteSection post={post} />
      <Flex flex={1} justifyContent="space-between" align="center">
        <Box>
          <NextLink href="/post/[id]" as={`/post/${post.id}`}>
            <Link>
              <Heading fontSize="xl" textColor="gray.700">
                {post.title}
              </Heading>
            </Link>
          </NextLink>
          <Text mt={1} fontSize="sm" textColor="gray.500">
            submitted by {post.creator.username}
          </Text>
          <Text
            flex={1}
            mt={3}
            fontSize="sm"
            textColor="gray.700"
            maxWidth="600px"
            isTruncated
          >
            {post.textSnippet}
          </Text>
        </Box>
        <Box flexShrink={0}>
          <EditDeletePostButtons id={post.id} creatorId={post.creator.id} />
        </Box>
      </Flex>
    </Flex>
  );
};

export default PostSnippet;
