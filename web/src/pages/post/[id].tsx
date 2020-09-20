import { Box, Flex, Heading, Text } from '@chakra-ui/core';
import { useRouter } from 'next/router';
import React from 'react';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import Layout from '../../components/Layout';
import UpvoteSection from '../../components/UpvoteSection';
import { usePostQuery } from '../../generated/graphql';
import { useGetIntId } from '../../utils/useGetIntId';
import { withApollo } from '../../utils/withApollo';

interface PostProps {}

const Post: React.FC<PostProps> = ({}) => {
  const router = useRouter();
  const intId = useGetIntId(router.query.id);
  const { data, error, loading } = usePostQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });

  if (loading) {
    return (
      <Layout>
        <Box>loading...</Box>
      </Layout>
    );
  }

  if (error) {
    return <Box>{error.message}</Box>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex align="top">
        <Box mt={2} mr={4}>
          <UpvoteSection post={data.post} />
        </Box>
        <Box w="100%">
          <Heading fontSize="3xl" mb={2}>
            {data.post.title}
          </Heading>
          <Flex mb={6} justify="start" align="center">
            <Text textColor="gray.500" mr={4}>
              submitted by {data.post.creator.username}
            </Text>
            <EditDeletePostButtons
              id={data.post.id}
              creatorId={data.post.creator.id}
            />
          </Flex>
          <Box>{data.post?.text}</Box>
        </Box>
      </Flex>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
