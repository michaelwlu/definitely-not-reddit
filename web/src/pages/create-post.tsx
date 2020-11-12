import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import Button from '../components/misc/Button';
import Header from '../components/misc/Header';
import InputField from '../components/misc/InputField';
import Layout from '../components/misc/Layout';
import Meta from '../components/misc/Meta';
import ContentLink from '../components/posts/ContentLink';
import { useCreatePostMutation, useVoteMutation } from '../generated/graphql';
import findLink from '../utils/findLink';
import { useIsAuth } from '../utils/useIsAuth';
import { postValidation } from '../utils/validationSchemas';
import { withApollo } from '../utils/withApollo';

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();

  useIsAuth();
  const [createPost] = useCreatePostMutation();
  const [vote] = useVoteMutation();

  return (
    <Layout variant="small">
      <Meta title="Create post" />
      <Header>Create Post</Header>
      <Formik
        initialValues={{ title: '', text: '' }}
        validationSchema={postValidation}
        validateOnBlur={false}
        onSubmit={async (values) => {
          const url = findLink(values.text);

          const { data, errors } = await createPost({
            variables: {
              input: {
                ...values,
                ...(url && { url: url.href, linkText: url.value }),
              },
            },
            update: (cache) => {
              cache.evict({ fieldName: 'posts:{}' });
            },
          });
          if (!errors) {
            if (data?.createPost.id) {
              await vote({
                variables: {
                  postId: data?.createPost.id,
                  input: 1,
                },
              });
            }
            await router.push(`/post/${data?.createPost.id}`);
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-4">
            <InputField
              as="input"
              name="title"
              placeholder="Title"
              label="Title"
            />
            <InputField
              as="textarea"
              name="text"
              placeholder={`e.g. text, links, images, gifs, YouTube, Twitch, etc.`}
              label="Content"
              rows={8}
            />
            <ContentLink text={values.text} />
            <Button type="submit" isLoading={isSubmitting}>
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
