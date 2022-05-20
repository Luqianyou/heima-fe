import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入全局样式表
import './assets/css/global.css'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'
// 导入副文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入副文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入 NProgress 包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'https://api.naccl.top/vue/shop/api/private/v1/'
// 在 request 拦截器中，展示进度条 NProgress.start();
axios.interceptors.request.use(config => {
  NProgress.start()
  // console.log(config)
  // 为请求头对象，添加 Token 验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
// 在 response 拦截器中，隐藏进度条 NProgress.done();
axios.interceptors.response.use(config =>{
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.prototype.productionTip = false

Vue.component('tree-table',TreeTable)
// 将副文本编辑器注册为全局可用组件
Vue.use(VueQuillEditor)

// 全局时间过滤器
Vue.filter('dateFormat',function(originVal){
 const dt = new Date(originVal)

 const y = dt.getFullYear()
 const m = (dt.getMonth() + 1 +'').padStart(2,'0')
 const d = (dt.getDate() +'').padStart(2,'0')

 const hh = (dt.getHours() +'').padStart(2,'0')
 const mm = (dt.getMinutes() +'').padStart(2,'0')
 const ss = (dt.getSeconds() +'').padStart(2,'0')

 return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
