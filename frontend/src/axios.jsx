
import axios from 'axios';

const host = window.location.hostname;
const isLocal = host === 'localhost' || host === '127.0.0.1';

const instance = axios.create({
  baseURL: isLocal
    ? 'http://localhost:3000'
    : 'https://ekurl.in',

  withCredentials: true,
});


instance.defaults.redirecturl = isLocal
  ? 'localhost:3000'
  : 'ekurl.in';

export default instance;
