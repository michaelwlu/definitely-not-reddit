import { Form, Formik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import Button from '../components/misc/Button';
import Header from '../components/misc/Header';
import InputField from '../components/misc/InputField';
import Layout from '../components/misc/Layout';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';
import { postValidation } from '../utils/validationSchemas';

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();

  useIsAuth();
  const [createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Head>
        <title>Create Post | Definitely Not Reddit</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header>Create Post</Header>
      <Formik
        initialValues={{ title: '', text: '' }}
        validationSchema={postValidation}
        validateOnBlur={false}
        onSubmit={async (values) => {
          const { data, errors } = await createPost({
            variables: { input: values },
            update: (cache) => {
              cache.evict({ fieldName: 'posts:{}' });
            },
          });
          if (!errors) {
            await router.push(`/post/${data?.createPost.id}`);
            window.scrollTo(0, 0);
          }
        }}
      >
        {({ isSubmitting }) => (
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
              placeholder={`e.g. text, website, image/gif/mp4 url, YouTube/Vimeo/Twitch link`}
              label="Content"
              rows={8}
            />
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
