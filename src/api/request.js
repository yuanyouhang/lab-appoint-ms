import axios from 'axios';
import { ElMessage } from 'element-plus';

const service = axios.create({
    // baseURL: 'http://localhost:8098',
    baseURL: 'https://yuanyouhang.com',
    // baseURL: 'http://47.100.62.167:8098',
    timeout: 8000
});

// 请求拦截器
service.interceptors.request.use(
    config => {
      // const token = localStorage.getItem('token');
      // if(token) {
      //   config.headers.Authorization = 'Bearer ' + token;// 后端验证接口要求必须添加前缀：'Bearer '
      // }
      return config;
    },
    error => {
      console.log(error);
      return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        if(response.status === 200) {
            return response.data;
        }
        // else if(response.status === 401) {
        //   ElMessage.error('未通过验证！');
        // }
    },
    error => {
        // console.log(error);
        ElMessage.error('' + error);
        return Promise.reject(error);
    }
);

export default service;