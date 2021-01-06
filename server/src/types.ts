import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Redis } from 'ioredis';
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { createUserLoader } from './utils/createUserLoader';

export type MyContext = {
  req: Request & {
    session: Session &
      Partial<SessionData> & { userId?: number; username?: string };
  };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
