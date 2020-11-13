import React, { useState } from 'react';
import { usePostCommentsQuery } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';
import LoadingSpinner from '../misc/LoadingSpinner';
import CreateComment from './CreateComment';
import EditContext from './EditContext';
import SingleComment from './SingleComment';

interface CommentsSectionProps {
  postIntId: number;
  postCreatorId: number;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  postIntId,
  postCreatorId,
}) => {
  const [sectionEdit, setSectionEdit] = useState<number | null>(null);

  const { data, error, loading } = usePostCommentsQuery({
    skip: postIntId === -1,
    variables: {
      postId: postIntId,
    },
    errorPolicy: 'all',
  });

  if (loading) {
    return (
      <div className="flex justify-center mt-14">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-14">{error.message}</div>;
  }

  if (!data?.postComments) {
    return <div className="text-center mt-14">Could not find comments</div>;
  }
  return (
    <EditContext.Provider value={{ sectionEdit, setSectionEdit }}>
      <div className="ml-2 sm:ml-12">
        <div className="text-sm font-medium text-gray-500 mt-14">
          <svg
            className="inline-block w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          {data.postComments.length}
          {data.postComments.length === 1 ? ' comment' : ' comments'}
        </div>
        <CreateComment postId={postIntId} />
      </div>
      <div className="my-8">
        {data.postComments.map((c) => (
          <SingleComment key={c.id} comment={c} postCreatorId={postCreatorId} />
        ))}
      </div>
    </EditContext.Provider>
  );
};

export default withApollo({ ssr: true })(CommentsSection);
