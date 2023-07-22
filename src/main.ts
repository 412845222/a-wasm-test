import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import dwebUI from "dweb-ui/dist_com/es/"
import "dweb-ui/dist_com/es/style.css"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

createApp(App).use(dwebUI).use(ElementPlus).mount('#app')
