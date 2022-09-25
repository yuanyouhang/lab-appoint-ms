import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// import 'element-plus/dist/index.css'
import 'element-plus/lib/theme-chalk/index.css';

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/css/icon.css'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, {
  locale: zhCn
}).use(store).use(router).mount('#app')