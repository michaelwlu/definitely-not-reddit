import { Form, Formik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import Button from '../../../components/misc/Button';
import Header from '../../../components/misc/Header';
import InputField from '../../../components/misc/InputField';
import Layout from '../../../components/misc/Layout';
import LoadingSpinner from '../../../components/misc/LoadingSpinner';
import {
  usePostQuery,
  useUpdatePostMutation,
} from '../../../generated/graphql';
import { useGetIntId } from '../../../utils/useGetIntId';
import { postValidation } from '../../../utils/validationSchemas';
import { withApollo } from '../../../utils/withApollo';

interface EditPostProps {}

const EditPost: React.FC<EditPostProps> = ({}) => {
  const router = useRouter();
  const intId = useGetIntId(router.query.id);
  const { data, loading } = usePostQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [updatePost] = useUpdatePostMutation();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <div className="text-center text-gray-700">Could not find post</div>
        <Link href="/">
          <Button addClassName="mx-auto mt-6">Back to home</Button>
        </Link>
      </Layout>
    );
  }
  return (
    <Layout variant="small">
      <Head>
        <title>Edit post | Definitely Not Reddit</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header>Edit Post</Header>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        validationSchema={postValidation}
        validateOnBlur={false}
        onSubmit={async (values) => {
          await updatePost({
            variables: { id: intId, ...values },
            update: (cache) => {
              cache.evict({ id: 'Post:' + intId });
            },
          });
          router.push('/post/[id]', `/post/${data?.post?.id}`);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <InputField
              as="input"
              name="title"
              placeholder="title"
              label="Title"
            />
            <InputField
              as="textarea"
              name="text"
              placeholder={`e.g. text, website, image/gif/mp4 url, YouTube/Vimeo/Twitch link`}
              label="Content"
              rows={8}
            />
            <div className="flex items-center space-x-4">
              <Button type="submit" isLoading={isSubmitting}>
                Update post
              </Button>
              <a
                className="text-sm text-gray-500 transition duration-150 ease-in-out cursor-pointer hover:text-gray-800"
                onClick={() => router.back()}
              >
                Cancel
              </a>
            </div>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(EditPost);
