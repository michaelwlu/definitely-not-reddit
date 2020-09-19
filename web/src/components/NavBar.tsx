import { useApolloClient } from '@apollo/client';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

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
        <NextLink href="/login">
          <Link color="white" mr={2}>
            login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">register</Link>
        </NextLink>
      </>
    );
    // user logged in
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4} size="sm">
            Create Post
          </Button>
        </NextLink>
        <Box mr={2} color="white">
          {data.me.username}
        </Box>
        <Button
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
            router.push('/');
          }}
          isLoading={logoutLoading}
          variant="link"
          color="white"
          fontWeight="medium"
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="themeTomato" p={4}>
      <Flex flex={1} mx="auto" align="center" maxW={1024}>
        <NextLink href="/">
          <Link color="white">
            <Heading size="lg">Definitely Not Reddit</Heading>
          </Link>
        </NextLink>
        <Box ml={'auto'}>{body}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
