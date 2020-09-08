import { dedupExchange, fetchExchange, Exchange } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  VoteMutationVariables,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import { pipe, tap } from 'wonka';
import Router from 'next/router';
import { cursorPagination } from './cursorPagination';
import gql from 'graphql-tag';
import { isServer } from './isServer';

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        Router.replace('/login');
      }
    })
  );
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';
  if (isServer()) {
    cookie = ctx.req.headers.cookie;
  }
  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            vote: (_result, args, cache, info) => {
              const { postId, input } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any
              );
              if (data) {
                let pointsChange;
                let voteCondition;

                if (data.voteStatus === input) {
                  pointsChange = -1;
                  voteCondition = null;
                } else if (data.voteStatus === -1 * input) {
                  pointsChange = 2;
                  voteCondition = input;
                } else {
                  pointsChange = 1;
                  voteCondition = input;
                }

                const newPoints =
                  (data.points as number) + pointsChange * input;

                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  {
                    id: postId,
                    points: newPoints,
                    voteStatus: voteCondition,
                  } as any
                );
              }
            },
            createPost: (_result, args, cache, info) => {
              const allFields = cache.inspectFields('Query');
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === 'posts'
              );
              fieldInfos.forEach((fi) => {
                cache.invalidate('Query', 'posts', fi.arguments || {});
              });
            },
            logout: (_result, args, cache, info) => {
              // me query return null
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                {
                  query: MeDocument,
                },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
            },

            register: (_result, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                {
                  query: MeDocument,
                },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
