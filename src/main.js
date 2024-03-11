import { createApp } from 'vue'
import './tailwind.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.css'
import App from './App.vue'
import { createPinia } from "pinia";
import router from "@/router";



export const app = createApp(App)



import { ws,renderProgress, isRenderDisable,isDownloadDisable,jobName,isRepeat,temp,receivedSize,saveFileName,jobuid,histroyWorkList,renderId,myId,workNameId,state,isSend,progressCount,tempInfo,writable,downloadProgress,downloadJobId} from '@/utils/websocket'
app.provide('ws', ws) 
app.provide('renderProgress', renderProgress) 
app.provide('isRenderDisable', isRenderDisable) 
app.provide('isDownloadDisable', isDownloadDisable) 
app.provide('jobName', jobName) 
app.provide('isRepeat', isRepeat) 
app.provide('temp', temp) 
app.provide('receivedSize', receivedSize) 
app.provide('saveFileName', saveFileName) 
app.provide('jobuid', jobuid) 
app.provide('histroyWorkList', histroyWorkList) 
app.provide('renderId', renderId) 
app.provide('myId', myId) 
app.provide('workNameId', workNameId) 
app.provide('state', state) 
app.provide('isSend', isSend) 
app.provide('progressCount', progressCount) 
app.provide('tempInfo', tempInfo) 
app.provide('writable', writable) 
app.provide('downloadProgress', downloadProgress) 
app.provide('downloadJobId', downloadJobId) 











app.use(createPinia()).use(router).use(ElementPlus, {
  locale: zhCn,
}).mount('#app')
