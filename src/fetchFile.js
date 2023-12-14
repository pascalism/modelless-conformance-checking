import Papa from 'papaparse';
import axios from 'axios';

export default async (setState, customPath) => {
  try {
    await axios
      .get(
        `https://modelless-conformance-backend-5x5kbkgjg-pascalismaschke.vercel.app/${customPath}`
      )
      .then((response) => {
        console.log(response.data);
        const parsedCsv = Papa.parse(response.data, { header: true });
        setState(parsedCsv.data);
      });
  } catch (error) {
    console.error('Error fetching files:', error);
  }
};
