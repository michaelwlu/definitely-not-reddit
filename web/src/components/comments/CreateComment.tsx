import { Form, Formik } from 'formik';
import Link from 'next/link';
import React from 'react';
import {
  PostCommentsDocument,
  useCreateCommentMutation,
  useMeQuery,
} from '../../generated/graphql';
import { useIsAuth } from '../../utils/useIsAuth';
import { commentValidation } from '../../utils/validationSchemas';
import { withApollo } from '../../utils/withApollo';
import Button from '../misc/Button';
import InputField from '../misc/InputField';

interface CreateCommentProps {
  postId: number;
}

const CreateComment: React.FC<CreateCommentProps> = ({ postId }) => {
  const [createComment] = useCreateCommentMutation();
  const { data, loading } = useMeQuery();
  return !loading && !data?.me ? (
    <div className="h-20 py-3 pl-3 mt-3 text-gray-400 border border-gray-300 rounded-md bg-gray-50">
      <Link href="/login">
        <a className="font-medium text-orange-400 transition duration-150 ease-in-out cursor-pointer hover:text-gray-500 focus:outline-none focus:text-gray-500">
          Log in
        </a>
      </Link>
      {' or '}
      <Link href="/signup">
        <a className="font-medium text-orange-400 transition duration-150 ease-in-out cursor-pointer hover:text-gray-500 focus:outline-none focus:text-gray-500">
          sign up
        </a>
      </Link>{' '}
      to leave a comment
    </div>
  ) : (
    <Formik
      initialValues={{ text: '' }}
      validationSchema={commentValidation}
      validateOnBlur={false}
      onSubmit={async (values, { resetForm }) => {
        const { errors } = await createComment({
          variables: { input: { ...values, postId } },
          refetchQueries: [
            { query: PostCommentsDocument, variables: { postId } },
          ],
          update: (cache) => {
            cache.evict({ fieldName: 'posts:{}' });
          },
        });
        if (!errors) {
          resetForm();
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <InputField
            as="textarea"
            name="text"
            placeholder="what are your thoughts?"
            aria-label="Body"
            rows={3}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Comment
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default withApollo({ ssr: false })(CreateComment);
