import { Form, Formik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import Button from '../components/Button';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  return (
    <Layout variant="small">
      <Head>
        <title>Definitely Not Reddit - Forgot password</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Formik
        initialValues={{ usernameOrEmail: '' }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <div>
              <div className="text-center ">
                Password reset sent - please check your email
              </div>
              <Link href="/login">
                <Button
                  text="Back"
                  variant="teal"
                  addClassName="mx-auto mt-6"
                />
              </Link>
            </div>
          ) : (
            <Form className="space-y-4">
              <InputField
                name="usernameOrEmail"
                placeholder="username or email"
                label="Username or Email"
              />
              <Button
                text="Reset password"
                type="submit"
                isLoading={isSubmitting}
                variant="teal"
              />
            </Form>
          )
        }
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
