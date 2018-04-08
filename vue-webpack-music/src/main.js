// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import fastclick from 'fastclick'
import Vue from 'vue'
import App from './App'
import router from './router'
import HelloWorld from '@/components/HelloWorld.vue'
import VueLazyload from 'vue-lazyload'
import 'common/stylus/index.styl'
import store from './store'

/* eslint-disable no-unused-vars */
//import vConsole from 'vconsole'
//
//console.log('aaaaaaaaaa')

fastclick.attach(document.body)

Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  store
})
