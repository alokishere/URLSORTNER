
import axios from 'axios';

const host = typeof window === 'undefined' ? '' : window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';
const productionApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://www.ekurl.in';

const instance = axios.create({
  baseURL: isLocal
    ? 'http://localhost:3000'
    : productionApiBaseUrl,

  withCredentials: true,
});


instance.defaults.redirecturl = isLocal
  ? 'localhost:3000'
  : 'www.ekurl.in';

export default instance;
