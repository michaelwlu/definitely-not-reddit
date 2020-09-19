import { Button, Flex, Stack } from '@chakra-ui/core';
import Layout from '../components/Layout';
import PostSnippet from '../components/PostSnippet';
import { usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: { limit: 15, cursor: null },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    return <div>{error?.message}</div>;
  }

  return (
    <Layout>
      {!data && loading ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((p) =>
            !p ? null : <PostSnippet key={p.id} post={p} />
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
              });
            }}
            isLoading={loading}
            m="auto"
            my={8}
          >
            Load More...
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};
export default withApollo({ ssr: true })(Index);
