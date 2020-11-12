import axios from 'axios';

const checkUrl = async (url: string): Promise<boolean> => {
  try {
    const config = {
      headers: {
        Accept: '*/*',
        'User-Agent': 'facebookexternalhit/1.1',
      },
      timeout: 5000,
    };
    const res = await axios.get(url, config);
    return res.status < 400;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export default checkUrl;
