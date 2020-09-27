import { Form, Formik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import Button from '../components/Button';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withApollo } from '../utils/withApollo';

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [login] = useLoginMutation();
  return (
    <Layout variant="small">
      <Head>
        <title>Log in | Definitely Not Reddit</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({
            variables: values,
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.login.user,
                },
              });
              cache.evict({ fieldName: 'posts:{}' });
            },
          });
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next);
            } else {
              router.push('/');
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="username or email"
              label="Username or Email"
            />
            <InputField
              name="password"
              placeholder="password"
              label="Password"
              type="password"
              addClassName="mt-4"
            />
            <div className="flex">
              <Link href="/forgot-password">
                <a className="mt-2 ml-auto text-sm text-gray-400 transition duration-150 ease-in-out hover:text-gray-500">
                  forgot password?
                </a>
              </Link>
            </div>
            <Button
              text="Log in"
              type="submit"
              isLoading={isSubmitting}
              variant="teal"
            />
          </Form>
        )}
      </Formik>
      <div className="mt-3">
        <Link href="/signup">
          <a className="text-sm text-gray-400 transition duration-150 ease-in-out hover:text-gray-500">
            Need an account? Sign up now
          </a>
        </Link>
      </div>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Login);
