import { Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import Button from '../../../components/misc/Button';
import Header from '../../../components/misc/Header';
import InputField from '../../../components/misc/InputField';
import Layout from '../../../components/misc/Layout';
import LoadingSpinner from '../../../components/misc/LoadingSpinner';
import Meta from '../../../components/misc/Meta';
import ContentLink from '../../../components/posts/ContentLink';
import {
  usePostQuery,
  useUpdatePostMutation,
} from '../../../generated/graphql';
import findLink from '../../../utils/findLink';
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
    errorPolicy: 'all',
  });
  const [updatePost] = useUpdatePostMutation();

  if (loading) {
    return (
      <Layout>
        <Meta />
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Meta title="Error" />
        <div className="text-center text-gray-700">Could not find post</div>
        <Link href="/">
          <Button addClassName="mx-auto mt-6">Back to home</Button>
        </Link>
      </Layout>
    );
  }
  return (
    <Layout variant="small">
      <Meta title="Edit post" />
      <Header>Edit Post</Header>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        validationSchema={postValidation}
        validateOnBlur={false}
        onSubmit={async (values) => {
          const url = findLink(values.text);
          await updatePost({
            variables: {
              id: intId,
              input: {
                ...values,
                ...(url && { url: url.href, linkText: url.value }),
              },
            },
            update: (cache) => {
              cache.evict({ id: 'Post:' + intId });
            },
          });
          router.push('/post/[id]', `/post/${data?.post?.id}`);
        }}
      >
        {({ isSubmitting, values }) => (
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
            <ContentLink text={values.text} />
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
