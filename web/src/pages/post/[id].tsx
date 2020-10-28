import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import CommentsSection from '../../components/comments/CommentsSection';
import Button from '../../components/misc/Button';
import Layout from '../../components/misc/Layout';
import LoadingSpinner from '../../components/misc/LoadingSpinner';
import PostBody from '../../components/posts/PostBody';
import PostOrigin from '../../components/posts/PostOrigin';
import UpvoteSection from '../../components/posts/UpvoteSection';
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
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center">{error.message}</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <div className="text-lg text-center text-gray-600">
          Could not find post ¯\_(ツ)_/¯
        </div>
        <Link href="/">
          <Button addClassName="mx-auto mt-6">Back to home</Button>
        </Link>
      </Layout>
    );
  }

  return (
    <Layout variant="regular">
      <Head>
        <title>{data.post.title} | Definitely Not Reddit</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="flex items-start">
        <div className="mt-1 mr-3 sm:mr-4">
          <UpvoteSection post={data.post} />
        </div>
        <div className="w-full">
          <h1 className="min-w-0 mb-2 text-2xl font-bold text-gray-700 break-words">
            {data.post.title}
          </h1>
          <PostOrigin post={data.post} />
          <div className="mt-6">
            {data.post.text ? (
              <PostBody text={data.post.text} id={intId} />
            ) : null}
          </div>
        </div>
      </div>
      <CommentsSection postIntId={intId} />
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
