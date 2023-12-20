import Papa from 'papaparse';
import axios from 'axios';

export default async (setState, customPath) => {
  const isLocalhost = window.location.hostname === 'localhost';
  try {
    await axios
      .get(
        `${
          isLocalhost
            ? 'http://localhost:4000'
            : 'https://modelless-conformance-backend-3xbp53af0-pascalismaschke.vercel.app'
        }/${customPath}`
      )
      .then((response) => {
        const parsedCsv = Papa.parse(response.data, { header: true });
        setState(parsedCsv.data);
      });
  } catch (error) {
    console.error('Error fetching files:', error);
  }
};
