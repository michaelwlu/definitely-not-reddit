import React from 'react';
import Button from '../components/misc/Button';
import ContentAnnouncement from '../components/misc/ContentAnnouncement';
import Layout from '../components/misc/Layout';
import LoadingSpinner from '../components/misc/LoadingSpinner';
import Meta from '../components/misc/Meta';
import PostSnippet from '../components/posts/PostSnippet';
import { usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: { limit: 15, cursor: null },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });

  return (
    <Layout fullBleed={true}>
      <Meta />
      <ContentAnnouncement />
      {!data && loading ? (
        <div className="flex items-center justify-center text-gray-700 h-52">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center">
          <div className="text-center">Server Error: {error.message}</div>
          <div className="mt-3 text-center">Please try again later</div>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-6">
          {data!.posts.posts.map((p) =>
            !p ? null : <PostSnippet key={p.id} post={p} />
          )}
        </div>
      )}
      {data && data.posts.hasMore ? (
        <div className="flex justify-center mt-8">
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
            type="button"
            isLoading={loading}
          >
            load more
          </Button>
        </div>
      ) : null}
    </Layout>
  );
};
export default withApollo({ ssr: true })(Index);
