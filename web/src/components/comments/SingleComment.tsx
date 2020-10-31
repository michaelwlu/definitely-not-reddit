import React, { useContext, useState } from 'react';
import { RegularCommentFragment, useMeQuery } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';
import TimeAgo from '../misc/TimeAgo';
import EditComment from './EditComment';
import EditContext from './EditContext';
import EditDeleteCommentButtons from './EditDeleteCommentButtons';

interface SingleCommentProps {
  comment: RegularCommentFragment;
  postCreatorId: number;
}

const SingleComment: React.FC<SingleCommentProps> = ({
  comment,
  postCreatorId,
}) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [changed, setChanged] = useState<boolean>(false);
  const { sectionEdit } = useContext(EditContext);
  const { data: meData } = useMeQuery();

  return (
    <div className="flex">
      <div className="flex items-center justify-center flex-shrink-0 mt-6 mr-3 text-base font-medium text-white bg-gray-400 bg-opacity-50 rounded-full w-9 h-9">
        {comment.user.username[0].toUpperCase()}
      </div>
      <div className="flex-grow pt-5 pb-6 overflow-hidden border-b border-gray-200">
        <div className="flex items-center">
          <div
            className={`${
              meData?.me?.id === comment.user.id
                ? 'text-teal-500'
                : meData?.me?.id === postCreatorId
                ? 'text-orange-500'
                : 'text-gray-500'
            } mr-2 text-sm`}
          >
            {comment.user.username}
            <span className="text-xs text-gray-400">
              <TimeAgo
                createdAt={comment.createdAt}
                updatedAt={comment.updatedAt}
              />
            </span>
          </div>
          <EditDeleteCommentButtons
            id={comment.id}
            userId={comment.user.id}
            useEdit={{ edit, setEdit }}
            useChanged={{ changed, setChanged }}
          />
        </div>
        {edit && sectionEdit === comment.id ? (
          <div>
            <EditComment
              comment={comment}
              setEdit={setEdit}
              useChanged={{ changed, setChanged }}
            />
          </div>
        ) : (
          <div className="mt-1 break-words">{comment.text}</div>
        )}
      </div>
    </div>
  );
};

export default withApollo({ ssr: false })(SingleComment);
