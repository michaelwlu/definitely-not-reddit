import DataLoader from 'dataloader';
import { Upvote } from '../entities/Upvote';

// input: array of {postId, userId}
// output: array of {postId, userId, value}
export const createUpvoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Upvote | null>(
    async (keys) => {
      const upvotes = await Upvote.findByIds(keys as any);
      const upvoteIdToUpvote: Record<string, Upvote> = {};
      upvotes.forEach((upvote) => {
        upvoteIdToUpvote[`${upvote.userId}|${upvote.postId}`] = upvote;
      });

      const sortedUpvotes = keys.map(
        (key) => upvoteIdToUpvote[`${key.userId}|${key.postId}`]
      );
      return sortedUpvotes;
    }
  );
