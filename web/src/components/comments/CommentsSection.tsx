import React, { useState } from 'react';
import { usePostCommentsQuery } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';
import LoadingSpinner from '../misc/LoadingSpinner';
import CreateComment from './CreateComment';
import EditContext from './EditContext';
import SingleComment from './SingleComment';

interface CommentsSectionProps {
  postIntId: number;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postIntId }) => {
  const [sectionEdit, setSectionEdit] = useState<number | null>(null);

  const { data, error, loading } = usePostCommentsQuery({
    skip: postIntId === -1,
    variables: {
      postId: postIntId,
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center">{error.message}</div>;
  }

  if (!data?.postComments) {
    return <div className="text-center">Could not find post</div>;
  }
  return (
    <EditContext.Provider value={{ sectionEdit, setSectionEdit }}>
      <div className="mt-16 text-sm font-medium text-gray-500">
        {data.postComments.length}
        {data.postComments.length === 1 ? ' comment' : ' comments'}
      </div>
      <CreateComment postId={postIntId} />
      <div className="mt-8 space-y-5">
        {data.postComments.map((c) => (
          <SingleComment
            key={c.id}
            comment={c}
            // sectionEdit={sectionEdit}
            // setSectionEdit={setSectionEdit}
          />
        ))}
      </div>
    </EditContext.Provider>
  );
};

export default withApollo({ ssr: true })(CommentsSection);
