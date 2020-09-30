import React, { useContext, useState } from 'react';
import TimeAgo from 'react-timeago';
import { RegularCommentFragment } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';
import EditComment from './EditComment';
import EditContext from './EditContext';
import EditDeleteCommentButtons from './EditDeleteCommentButtons';

interface SingleCommentProps {
  comment: RegularCommentFragment;
}

const SingleComment: React.FC<SingleCommentProps> = ({ comment }) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [changed, setChanged] = useState<boolean>(false);
  const { sectionEdit } = useContext(EditContext);

  return (
    <div>
      <div className="flex items-center">
        <div className="mr-2 text-sm text-gray-500">
          {comment.user.username}
          <span className="text-xs text-gray-400">
            {' · '}
            <TimeAgo date={Number(comment.createdAt)} />
            {comment.createdAt !== comment.updatedAt ? (
              <span>
                {' · edited '}
                <TimeAgo date={Number(comment.updatedAt)} />
              </span>
            ) : null}
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
        <div className="mt-1">{comment.text}</div>
      )}
    </div>
  );
};

export default withApollo({ ssr: false })(SingleComment);
