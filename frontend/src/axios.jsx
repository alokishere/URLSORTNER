
import axios from 'axios';

const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';

const instance = axios.create({
  baseURL: isLocal
    ? 'http://localhost:3000'
    : 'https://u.alokdev.in',

  withCredentials: true,
});


instance.defaults.redirecturl = isLocal
  ? 'localhost:3000'
  : 'u.alokdev.in';

export default instance;
