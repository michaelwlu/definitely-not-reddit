import axios from 'axios';

const checkUrl = async (url: string): Promise<boolean> => {
  try {
    const config = {
      headers: {
        Accept: 'application/text',
      },
      timeout: 5000,
    };
    const res = await axios.get(url, config);
    return res.status < 400;
  } catch (error) {
    return false;
  }
};

export default checkUrl;
