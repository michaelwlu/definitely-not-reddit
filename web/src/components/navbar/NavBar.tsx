import { useApolloClient } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useLogoutMutation, useMeQuery } from '../../generated/graphql';
import { isServer } from '../../utils/isServer';
import LoadingSpinner from '../misc/LoadingSpinner';
import MobileNavLink from './MobileNavLink';
import NavLink from './NavLink';

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const apolloClient = useApolloClient();
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  let rightNav = null;
  let dropdownNav = null;
  const [dropdown, setDropdown] = useState(false);

  // data is loading
  if (loading) {
    rightNav = (
      <div className="flex items-center justify-center text-white w-36">
        <LoadingSpinner />
      </div>
    );
    // user not logged in
  } else if (!data?.me) {
    rightNav = (
      <>
        <NavLink href="/login">log in</NavLink>
        <NavLink href="/signup">sign up</NavLink>
      </>
    );
    dropdownNav = (
      <>
        <MobileNavLink href="/login" onClick={() => setDropdown(!dropdown)}>
          log in
        </MobileNavLink>
        <MobileNavLink href="/signup" onClick={() => setDropdown(!dropdown)}>
          sign up
        </MobileNavLink>
      </>
    );
    // user logged in
  } else {
    rightNav = (
      <>
        <div className="flex items-center justify-center flex-shrink-0 mr-3 text-base font-medium text-white bg-gray-400 rounded-full w-9 h-9">
          {data.me.username[0].toUpperCase()}
        </div>
        <Link href="/create-post">
          <button className="flex items-center justify-center px-2.5 py-1.5 font-semibold leading-6 text-gray-600 whitespace-no-wrap transition duration-200 ease-in-out border-2 border-gray-100 bg-gray-100 rounded-lg text-sm focus:outline-none hover:bg-white hover:text-teal-500 hover:border-white focus:bg-white focus:text-teal-500 focus:border-white focus:shadow-outline-orange">
            create post
          </button>
        </Link>
        <NavLink
          onClick={async () => {
            await logout();
            await apolloClient.clearStore();
            await router.push('/');
            router.reload();
          }}
          href=""
        >
          log out
        </NavLink>
      </>
    );
    dropdownNav = (
      <>
        <MobileNavLink href="/create-post">create post</MobileNavLink>
        <MobileNavLink
          onClick={async () => {
            setDropdown(!dropdown);
            await logout();
            await apolloClient.clearStore();
            await router.push('/');
            router.reload();
          }}
          href=""
        >
          log out
        </MobileNavLink>
      </>
    );
  }

  return (
    // Nav background
    <nav className="relative z-10 w-full shadow-sm sm:shadow-md bg-nav">
      {/* Nav container */}
      <div className="max-w-4xl pl-3 pr-3 mx-auto sm:px-4">
        <div className="flex items-center justify-between h-20">
          {/* Left side nav */}
          <div className="flex">
            <Link href="/">
              <a className="flex items-center flex-shrink-0 p-2 text-white transition duration-150 ease-in-out rounded-lg sm:hover:text-orange-100 focus:outline-none sm:focus:text-orange-100">
                <svg
                  className="w-8 h-8"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 450 450"
                >
                  <path
                    fill="currentColor"
                    d="M409.133,109.203c-19.608-33.592-46.205-60.189-79.798-79.796C295.736,9.801,259.058,0,219.273,0
		c-39.781,0-76.47,9.801-110.063,29.407c-33.595,19.604-60.192,46.201-79.8,79.796C9.801,142.8,0,179.489,0,219.267
		c0,39.78,9.804,76.463,29.407,110.062c19.607,33.592,46.204,60.189,79.799,79.798c33.597,19.605,70.283,29.407,110.063,29.407
		s76.47-9.802,110.065-29.407c33.593-19.602,60.189-46.206,79.795-79.798c19.603-33.596,29.403-70.284,29.403-110.062
		C438.533,179.485,428.732,142.795,409.133,109.203z M361.74,259.517l-29.123,29.129c-3.621,3.614-7.901,5.424-12.847,5.424
		c-4.948,0-9.236-1.81-12.847-5.424l-87.654-87.653l-87.646,87.653c-3.616,3.614-7.898,5.424-12.847,5.424
		c-4.95,0-9.233-1.81-12.85-5.424l-29.12-29.129c-3.617-3.607-5.426-7.898-5.426-12.847c0-4.942,1.809-9.227,5.426-12.848
		l129.62-129.616c3.617-3.617,7.898-5.424,12.847-5.424s9.238,1.807,12.846,5.424L361.74,233.822
		c3.613,3.621,5.424,7.905,5.424,12.848C367.164,251.618,365.357,255.909,361.74,259.517z"
                  />
                </svg>
                <span className="hidden ml-3 text-2xl font-bold md:text-3xl sm:inline-block group">
                  Definitely Not Reddit
                </span>
                <span className="inline-block ml-3 text-2xl font-semibold sm:hidden">
                  DefNotReddit
                </span>
              </a>
            </Link>
          </div>
          {/* Right side nav */}
          <div className="items-center hidden space-x-3 text-sm md:text-base sm:flex">
            {rightNav}
          </div>
          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 sm:hidden">
            {data?.me ? (
              <div className="flex items-center justify-center flex-shrink-0 text-base font-medium text-white bg-gray-400 rounded-full w-9 h-9">
                {data.me.username[0].toUpperCase()}
              </div>
            ) : null}
            <button
              onClick={() => setDropdown(!dropdown)}
              className={`inline-flex p-1 text-white rounded-md focus:outline-none focus:bg-opacity-25 ${
                dropdown
                  ? 'bg-orange-600 bg-opacity-25 shadow-inner'
                  : 'shadow-none'
              }`}
            >
              {/* Open menu icon */}
              <svg
                className={`w-8 h-8 ${dropdown ? 'hidden' : 'block'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close menu icon */}
              <svg
                className={`w-8 h-8 ${dropdown ? 'block' : 'hidden'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Dropdown menu */}
      <div
        className={`${
          dropdown ? 'block' : 'hidden'
        } sm:hidden absolute bg-nav w-full shadow-sm border-b border-gray-200`}
      >
        <div className="">{dropdownNav}</div>
      </div>
    </nav>
  );
};

export default NavBar;
