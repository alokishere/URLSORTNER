import axios from 'axios';


//write the logic for if user accees from local then user local for for backend and if user com from live url then use live backend 

const host = window.location.hostname
console.log(host)
const instance = axios.create({
    // baseURL: 'http://localhost:3000',
    // redirecturl: 'localhost:3000',
    // baseURL: 'https://alokurl.vercel.app',
    baseURL: 'https://u.alokdev.in',
    redirecturl: 'u.alokdev.in',
    withCredentials: true,
});

export default instance