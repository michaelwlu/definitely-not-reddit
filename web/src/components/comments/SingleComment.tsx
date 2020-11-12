import React, { useContext, useState } from 'react';
import { RegularCommentFragment, useMeQuery } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';
import TimeAgo from '../misc/TimeAgo';
import UsernameIcon from '../misc/UsernameIcon';
import EditComment from './EditComment';
import EditContext from './EditContext';
import EditDeleteCommentButtons from './EditDeleteCommentButtons';
import Linkify from 'linkifyjs/react';

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
      <div className="flex-shrink-0 mt-6 mr-3">
        <UsernameIcon username={comment.user.username} />
      </div>
      <div className="flex-grow pt-5 pb-6 overflow-hidden border-b border-gray-200">
        <div className="flex items-center">
          <div
            className={`${
              meData?.me?.id === comment.user.id
                ? 'text-teal-500'
                : comment.user.id === postCreatorId
                ? 'text-orange-500 text-opacity-75'
                : 'text-gray-500'
            } mr-2 text-sm font-medium`}
          >
            {comment.user.username}
            <span className="text-xs font-normal text-gray-400">
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
          <div className="mt-1 break-words">
            <Linkify
              options={{
                className:
                  'text-teal-500 transition duration-150 ease-in-out hover:text-teal-400 focus:text-teal-400 focus:outline-none',
                attributes: {
                  rel: 'noopener',
                },
              }}
            >
              {comment.text}
            </Linkify>
          </div>
        )}
      </div>
    </div>
  );
};

export default withApollo({ ssr: false })(SingleComment);
