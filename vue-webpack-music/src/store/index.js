import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex) // 注册vuex插件
// 调试工具
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	actions,
	getters,
	state,
	mutations,
  	strict: debug, //严格模式，检测mutations的变化是在state中
  	plugins: debug ? [createLogger()] : []
})
