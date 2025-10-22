import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import axiosCookieJarSupport from 'axios-cookiejar-support';

axiosCookieJarSupport(axios);

const jar = new CookieJar();

const api = axios.create({
  baseURL: 'https://lyria-back.onrender.com',
  withCredentials: true,
  jar,
});

export default api;
