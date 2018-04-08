<template>
	<div ref="wrapper">
		<slot></slot>
	</div>
</template>

<script>
	import BScroll from 'better-scroll'
	
	export default{
		props: {
		      probeType: {
		        type: Number,
		        default: 1
		      },
		      click: {
		        type: Boolean,
		        default: true
		      },
		      listenScroll: {
		        type: Boolean,
		        default: false
		      },
		      data: {
		        type: Array,
		        default: null
		      },
		      pullup: {  // 是否派发滚动到底部的事件，用于上拉加载
		        type: Boolean,
		        default: false
		      },
		      beforeScroll: { //是否派发列表滚动开始的事件
		        type: Boolean,
		        default: false
		      },
		      refreshDelay: {  //指定刷新时间
		        type: Number,
		        default: 20
		      }
		    },
		    mounted() {
		      setTimeout(() => {
		        this._initScroll()
		      }, 20)
		    },
		    methods:{
		    	_initScroll(){
		    		if (!this.$refs.wrapper) {
			          return
			        }
		    		 
		    		this.scroll = new BScroll(this.$refs.wrapper, {
			          probeType: this.probeType,
			          click: this.click
			       })
		    		// // 是否派发滚动事件
		    		if(this.listenScroll){
		    			//保存this的指向
		    			let me=this
		    			//设置scroll监听事件,pos 是一个位置对象，有x,y轴的属性
		    			this.scroll.on('scroll',(pos) => {
		    				//派发一个事件
		    				me.$emit('scroll',pos)
		    			})
		    		}
		    		
		    		if (this.pullup) {
			          this.scroll.on('scrollEnd', () => {   // 是否派发滚动到底部事件，用于上拉加载
			            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {// 滚动到底部
			              this.$emit('scrollToEnd')
			            }
			          })
			        }
			
			        if (this.beforeScroll) { // 是否派发列表滚动开始的事件
			          this.scroll.on('beforeScrollStart', () => {
			            this.$emit('beforeScroll')
			          })
			        }
		    	},
		    	
		    	scrollTo() {
			        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
			    },
			    //使用时候传递两个参数：滚动到指定元素，滚动时间
			    scrollToElement() {
			        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
			    },
			    //代理better-scroll的disable方法
		      	disable() {
		       	 this.scroll && this.scroll.disable()
		      	},
		      	enable() { 
		      		//refresh()强制 scroll 重新计算，当 better-scroll 中的元素发生变化的时候调用此方法
		      		//enable()启用 better-scroll，默认开启
		      		//disable()  禁用 better-scroll
		       	 this.scroll && this.scroll.enable()
		      	},
		     	refresh() {
		       	 this.scroll && this.scroll.refresh()
		     	},
		    },
		    
	     	// 监听数据的变化，延时refreshDelay时间后调用refresh方法重新计算，保证滚动效果正常
	     	watch:{
	     		data(){
	     			setTimeout(() => {
				      this.refresh()
				    }, this.refreshDelay)
	     		}
	     	}
		    
		}
</script>

<style>
</style>