import { theme as chakraTheme } from '@chakra-ui/core';

const fonts = { ...chakraTheme.fonts, mono: `'Menlo', monospace` };

const breakpoints = ['40em', '52em', '64em'];

const theme = {
  ...chakraTheme,
  colors: {
    ...chakraTheme.colors,
    black: '#16161D',
    themeTomato: '#fe7d4e',
    upvote: {
      500: '#fe7d4e', // button color
      600: '#fe6a35', // button hover
    },
    downvote: {
      500: '#8080ff', // button color
      600: '#6767ff', // button hover
    },
  },
  fonts,
  breakpoints,
};

export default theme;
