import Linkify from 'linkifyjs/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import TimeAgo from 'react-timeago';
import CommentsSection from '../../components/comments/CommentsSection';
import Layout from '../../components/misc/Layout';
import LoadingSpinner from '../../components/misc/LoadingSpinner';
import EditDeletePostButtons from '../../components/posts/EditDeletePostButtons';
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
        <div className="text-center">Could not find post</div>
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
        <div className="mt-2 mr-2">
          <UpvoteSection post={data.post} />
        </div>
        <div className="w-full mt-1">
          <h1 className="mb-2 text-2xl font-bold">{data.post.title}</h1>
          <div className="flex items-center justify-start mb-6">
            <p className="mr-4 text-gray-400">
              posted by{' '}
              <span className="text-gray-700">
                {data.post.creator.username}
              </span>
              <span className="text-sm text-gray-400">
                {' · '}
                <TimeAgo date={Number(data.post.createdAt)} />
                {data.post.createdAt !== data.post.updatedAt ? (
                  <span>
                    {' · edited '}
                    <TimeAgo date={Number(data.post.updatedAt)} />
                  </span>
                ) : null}
              </span>
            </p>
            <EditDeletePostButtons
              id={data.post.id}
              creatorId={data.post.creator.id}
            />
          </div>
          <Linkify
            options={{
              className:
                'text-teal-500 transition duration-150 ease-in-out hover:text-teal-400',
            }}
          >
            {data.post?.text}
          </Linkify>
          <CommentsSection postIntId={intId} />
        </div>
      </div>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
