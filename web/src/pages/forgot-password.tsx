import { Form, Formik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import Button from '../components/misc/Button';
import Header from '../components/misc/Header';
import InputField from '../components/misc/InputField';
import Layout from '../components/misc/Layout';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [forgotPassword] = useForgotPasswordMutation();

  return (
    <Layout variant="small" leftBump={true}>
      <Head>
        <title>Definitely Not Reddit - Forgot password</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header>Forgot Password</Header>
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
                <Button addClassName="mx-auto mt-6">Back</Button>
              </Link>
            </div>
          ) : (
            <Form className="space-y-5">
              <InputField
                name="usernameOrEmail"
                placeholder="username or email"
                label="Username or Email"
              />
              <Button type="submit" isLoading={isSubmitting}>
                Reset password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
