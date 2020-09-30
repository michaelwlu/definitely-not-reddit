import { Form, Formik } from 'formik';
import React from 'react';
import {
  PostCommentsDocument,
  useCreateCommentMutation,
} from '../../generated/graphql';
import { useIsAuth } from '../../utils/useIsAuth';
import { withApollo } from '../../utils/withApollo';
import Button from '../misc/Button';
import InputField from '../misc/InputField';

interface CreateCommentProps {
  postId: number;
}

const CreateComment: React.FC<CreateCommentProps> = ({ postId }) => {
  useIsAuth();
  const [createComment] = useCreateCommentMutation();
  return (
    <Formik
      initialValues={{ text: '' }}
      onSubmit={async (values, { resetForm }) => {
        const { errors } = await createComment({
          variables: { input: { ...values, postId } },
          refetchQueries: [
            { query: PostCommentsDocument, variables: { postId } },
          ],
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
          <Button
            text="Comment"
            type="submit"
            isLoading={isSubmitting}
            variant="teal"
          />
        </Form>
      )}
    </Formik>
  );
};

export default withApollo({ ssr: false })(CreateComment);
