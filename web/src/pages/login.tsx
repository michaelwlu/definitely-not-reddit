import { Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import Button from '../components/misc/Button';
import Header from '../components/misc/Header';
import InputField from '../components/misc/InputField';
import Layout from '../components/misc/Layout';
import Meta from '../components/misc/Meta';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withApollo } from '../utils/withApollo';

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [login] = useLoginMutation();
  return (
    <Layout variant="small" leftBump={true}>
      <Meta title="Log in" />
      <Header>Log In</Header>
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
              await router.push('/');
              window.scrollTo(0, 0);
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
                <a className="mt-2 ml-auto text-sm text-gray-500 transition duration-150 ease-in-out hover:text-teal-500 focus:outline-none focus:text-teal-500">
                  forgot password?
                </a>
              </Link>
            </div>
            <Button type="submit" isLoading={isSubmitting}>
              Log in
            </Button>
          </Form>
        )}
      </Formik>
      <div className="mt-3">
        <Link href="/signup">
          <a className="text-sm text-gray-500 transition duration-150 ease-in-out hover:text-teal-500 focus:outline-none focus:text-teal-500">
            Need an account? Sign up now
          </a>
        </Link>
      </div>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Login);
