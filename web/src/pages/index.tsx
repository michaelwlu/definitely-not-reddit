import Head from 'next/head';
import React from 'react';
import Button from '../components/Button';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import PostSnippet from '../components/PostSnippet';
import { usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: { limit: 15, cursor: null },
    notifyOnNetworkStatusChange: true,
  });

  return (
    <Layout>
      <Head>
        <title>Home | Definitely Not Reddit</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {!data && loading ? (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-6">
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
            text="load more"
            variant="teal"
            type="button"
            isLoading={loading}
          />
        </div>
      ) : null}
    </Layout>
  );
};
export default withApollo({ ssr: true })(Index);
