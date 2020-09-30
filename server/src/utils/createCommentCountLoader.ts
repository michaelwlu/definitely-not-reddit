import DataLoader from 'dataloader';
import { Comment } from '../entities/Comment';

// input: array of user ids
// output: array of {user id: username} objects
export const createCommentCountLoader = () =>
  new DataLoader<number, number>(async (postIds) => {
    const postIdToCommentCount: Record<number, number> = {};
    postIds.forEach(async (id) => {
      const commentCount = await Comment.count({ where: { postId: id } });
      postIdToCommentCount[id] = commentCount;
    });

    const sortedCommentCounts = postIds.map(
      (postId) => postIdToCommentCount[postId]
    );
    return sortedCommentCounts;
  });
