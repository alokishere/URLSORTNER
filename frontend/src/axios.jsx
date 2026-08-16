import axios from 'axios';

const instance = axios.create({
    // baseURL: 'http://localhost:3000',
    // baseURL: 'https://alokurl.vercel.app',
    baseURL: 'https://u.alokdev.in',
    withCredentials: true,
});

export default instance
