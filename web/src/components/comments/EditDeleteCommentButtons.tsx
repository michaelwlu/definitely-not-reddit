import React, { Dispatch, SetStateAction, useContext } from 'react';
import { useDeleteCommentMutation, useMeQuery } from '../../generated/graphql';
import EditContext from './EditContext';

interface EditDeleteCommentButtonsProps {
  id: number;
  userId: number;
  useEdit: { edit: boolean; setEdit: Dispatch<SetStateAction<boolean>> };
  useChanged: {
    changed: boolean;
    setChanged: Dispatch<SetStateAction<boolean>>;
  };
}

const EditDeleteCommentButtons: React.FC<EditDeleteCommentButtonsProps> = ({
  id,
  userId,
  useEdit: { edit, setEdit },
  useChanged: { changed, setChanged },
}) => {
  const { setSectionEdit } = useContext(EditContext);
  const { data: meData } = useMeQuery();

  const [deleteComment] = useDeleteCommentMutation();

  if (meData?.me?.id !== userId && meData?.me?.username !== 'admin') {
    return null;
  }

  return (
    <div className="flex items-center">
      <button
        className="p-1 text-gray-400 transition duration-150 ease-in-out rounded-lg focus:outline-none hover:text-gray-500 focus:text-gray-500 active:text-gray-500"
        aria-label="Edit Comment"
        title="Edit Comment"
        onClick={() => {
          if (!edit) {
            setEdit(true);
            setSectionEdit(id);
          } else {
            let confirmation;
            if (changed) {
              confirmation = confirm(
                'Are you sure you want to discard your edits?'
              );
            }
            if (!changed || confirmation) {
              setEdit(false);
              setSectionEdit(null);
              setChanged(false);
            }
          }
        }}
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      <button
        className="p-1 text-gray-400 transition duration-150 ease-in-out rounded-lg focus:outline-none hover:text-gray-500 focus:text-gray-500 active:text-gray-500"
        aria-label="Delete Comment"
        title="Delete Comment"
        onClick={() => {
          confirm('Are you sure you would like to delete this comment?')
            ? deleteComment({
                variables: { id },
                update: (cache) => {
                  cache.evict({ id: 'Comment:' + id });
                  cache.evict({ fieldName: 'posts:{}' });
                },
              })
            : null;
        }}
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default EditDeleteCommentButtons;
