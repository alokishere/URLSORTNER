import axios from 'axios';
import { resolveConfig } from './config/env';

const config = resolveConfig(import.meta.env);
const instance = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
});
export default instance;
