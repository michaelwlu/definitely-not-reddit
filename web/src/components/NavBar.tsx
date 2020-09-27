import { useApolloClient } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import Button from './Button';
import NavLink from './NavLink';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const apolloClient = useApolloClient();
  const router = useRouter();
  const [logout, { loading: logoutLoading }] = useLogoutMutation();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  let body = null;

  // data is loading
  if (loading) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NavLink href="/login" text="log in" />
        <NavLink href="/signup" text="sign up" />
      </>
    );
    // user logged in
  } else {
    body = (
      <>
        <Link href="/create-post">
          <Button
            text="create post"
            type="button"
            addClassName=""
            variant="light"
            isLoading={false}
          />
        </Link>
        <div className="font-medium text-white">{data.me.username}</div>
        <NavLink
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
            router.push('/');
          }}
          href=""
          text="log out"
        />
      </>
    );
  }

  return (
    <nav className="sticky top-0 z-10 bg-orange-400">
      <div className="max-w-4xl px-2 mx-auto sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Left side nav */}
          <div className="flex items-center justify-center flex-1 sm:items-stretch sm:justify-start">
            <div className="flex items-center flex-shrink-0">
              <img src="/logo.png" className="w-auto h-8 mr-3" alt="Logo" />
              <Link href="/">
                <a className="text-3xl font-semibold text-white transition duration-150 ease-in-out hover:text-orange-100">
                  Definitely Not Reddit
                </a>
              </Link>
            </div>
          </div>
          {/* Right side nav */}
          <div className="flex items-center space-x-4">{body}</div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
