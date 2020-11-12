import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import CommentsSection from '../../components/comments/CommentsSection';
import Button from '../../components/misc/Button';
import Layout from '../../components/misc/Layout';
import LoadingSpinner from '../../components/misc/LoadingSpinner';
import Meta from '../../components/misc/Meta';
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
    errorPolicy: 'all',
  });

  if (loading) {
    return (
      <Layout>
        <Meta />
        <div className="flex items-center justify-center text-gray-700 h-52">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Meta title="Error" />
        <div className="text-center">{error.message}</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Meta title="Error" />
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
      <Meta title={data.post.title} />
      <div className="flex items-start">
        <div className="mr-3 sm:mt-5 sm:mr-4">
          <UpvoteSection post={data.post} />
        </div>
        <div className="w-full pb-7 sm:pl-7 sm:pr-8 sm:pt-5 sm:pb-8 sm:bg-white sm:border sm:border-gray-300 sm:rounded-md ">
          <h1 className="min-w-0 mb-2 text-2xl font-bold text-gray-700 break-words">
            {data.post.title}
          </h1>
          <PostOrigin post={data.post} />
          <div className="mt-6">
            {data.post.text ? (
              <PostBody post={data.post} isSnippet={false} />
            ) : null}
          </div>
        </div>
      </div>
      <CommentsSection postIntId={intId} postCreatorId={data.post.creator.id} />
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
