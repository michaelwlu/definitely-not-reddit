import { Form, Formik } from 'formik';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import {
  RegularCommentFragment,
  useUpdateCommentMutation,
} from '../../generated/graphql';
import { useIsAuth } from '../../utils/useIsAuth';
import { withApollo } from '../../utils/withApollo';
import Button from '../misc/Button';
import InputField from '../misc/InputField';
import EditContext from './EditContext';

interface EditCommentProps {
  comment: RegularCommentFragment;
  setEdit: Dispatch<SetStateAction<boolean>>;
  useChanged: {
    changed: boolean;
    setChanged: Dispatch<SetStateAction<boolean>>;
  };
}

const EditComment: React.FC<EditCommentProps> = ({
  comment,
  setEdit,
  useChanged: { changed, setChanged },
}) => {
  const { setSectionEdit } = useContext(EditContext);

  useIsAuth();
  const [updateComment] = useUpdateCommentMutation();
  return (
    <Formik
      initialValues={{ text: comment.text }}
      onSubmit={async (values) => {
        const { errors } = await updateComment({
          variables: { id: comment.id, ...values },
          update: (cache) => {
            cache.evict({ fieldName: 'comments:{}' });
          },
        });
        if (!errors) {
          setEdit(false);
          setSectionEdit(null);
          setChanged(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-2">
          <InputField
            as="textarea"
            name="text"
            aria-label="Body"
            rows={3}
            onChangeCapture={() => setChanged(true)}
          />
          <div className="flex items-center space-x-4">
            <Button
              text="Save Edits"
              type="submit"
              isLoading={isSubmitting}
              variant="teal"
              size="small"
            />
            <a
              className="text-xs text-gray-500 transition duration-150 ease-in-out cursor-pointer hover:text-gray-800"
              onClick={() => {
                let confirmation;
                if (changed) {
                  confirmation = confirm(
                    'Are you sure you want to discard your edits?'
                  );
                }
                if (!changed || confirmation) {
                  setEdit(false);
                  setSectionEdit(null);
                }
              }}
            >
              Cancel
            </a>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default withApollo({ ssr: false })(EditComment);
