import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Button from '../../components/misc/Button';
import Header from '../../components/misc/Header';
import InputField from '../../components/misc/InputField';
import Layout from '../../components/misc/Layout';
import Meta from '../../components/misc/Meta';
import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { userValidation } from '../../utils/validationSchemas';
import { withApollo } from '../../utils/withApollo';

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <Layout variant="small">
      <Meta title="Change password" />
      <Header>Change Password</Header>
      <Formik
        initialValues={{ newPassword: '' }}
        validationSchema={userValidation}
        validateOnBlur={false}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            variables: {
              newPassword: values.newPassword,
              token:
                typeof router.query.token === 'string'
                  ? router.query.token
                  : '',
            },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.changePassword.user,
                },
              });
              cache.evict({ fieldName: 'posts:{}' });
            },
          });

          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            // worked
            await router.push('/');
            window.scrollTo(0, 0);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError ? (
              <div className="flex mt-2 text-sm">
                <div className="mr-2 text-red-500">{tokenError}</div>
                <Link href="/forgot-password">
                  <a className="text-gray-500 transition duration-150 ease-in-out hover:text-gray-800">
                    - click here to request a new password reset
                  </a>
                </Link>
              </div>
            ) : null}
            <Button type="submit" isLoading={isSubmitting} addClassName="mt-6">
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(ChangePassword);
