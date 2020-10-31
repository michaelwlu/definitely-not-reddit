import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Button from '../components/misc/Button';
import Header from '../components/misc/Header';
import InputField from '../components/misc/InputField';
import Layout from '../components/misc/Layout';
import Meta from '../components/misc/Meta';
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { userValidation } from '../utils/validationSchemas';
import { withApollo } from '../utils/withApollo';

interface signUpProps {}

const SignUp: React.FC<signUpProps> = ({}) => {
  const router = useRouter();
  const [register] = useRegisterMutation();
  const [validateOnChange, setValidateOnChange] = useState(false);

  return (
    <Layout variant="small" leftBump={true}>
      <Meta title="Sign up" />
      <Header>Sign Up</Header>
      <Formik
        initialValues={{ username: '', email: '', password: '' }}
        validationSchema={userValidation}
        validateOnBlur={false}
        validateOnChange={validateOnChange}
        enableReinitialize
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: { options: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.register.user,
                },
              });
            },
          });
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            // worked
            await router.push('/');
            window.scrollTo(0, 0);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />
            <InputField
              name="email"
              placeholder="email"
              label="Email"
              addClassName="mt-4"
            />
            <InputField
              name="password"
              placeholder="password"
              label="Password"
              type="password"
              addClassName="mt-4"
            />
            <Button
              type="submit"
              onClick={() => setValidateOnChange(true)}
              isLoading={isSubmitting}
              addClassName="mt-6"
            >
              Sign up
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(SignUp);
