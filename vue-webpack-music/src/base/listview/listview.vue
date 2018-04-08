<template>
	<Scroll class="listview" 
		:data="data" 
		ref="listview" 
		:listenScroll='listenScroll'
		@scroll='scroll'
		:probeType='probeType'>
		<ul>
			<li v-for="group in data" class="list-group" ref="listGroup">
				<h2 class="list-group-title">{{group.title}}</h2>
				<ul>
					<li class="list-group-item" v-for="item in group.items"  @click="selectItem(item)">
						<img class="avatar" v-lazy="item.avatar"/>
						<span class="name">{{item.name}}</span>
					</li>
				</ul>
			</li>
		</ul>
		<div class="list-shortcut"  @touchstart.stop.prevent="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove"
         @touchend.stop>
			<ul>
				<li v-for="(item ,index) in shortcutList" 
					class="item" 
					:class="{'current':currentIndex===index}"
					:data-index="index">
					{{item}}
				</li>
			</ul>
		</div>
		<div class="list-fixed" v-show="fixedTitle" ref='fixed'>
			<h1 class="fixed-title">{{fixedTitle}}</h1>
		</div>
		<div v-show="!data.length" class="loading-container">
    	  <Loading></Loading>
    	</div>
	</Scroll>
</template>

<script>
	import Scroll from 'base/scroll/scroll'
 	import Loading from 'base/loading/loading'
  	import {getData} from 'common/js/dom'
  	
  	const TITLE_HEIGHT = 30
  	const ANCHOR_HEIGHT = 18  //每个字母间的高度差
	export default{
		props:{
			data:{
				type:Array,
				default:[]
			}
		},
		components:{
			Scroll,Loading
		},
		created() {
	      this.probeType = 3  // 快速滚动的方式
	      this.listenScroll = true  //是否监听Scroll事件
	      this.touch = {} //触摸的对象
	      this.listHeight = [] //每个列表类别的高度
	    },
	    data() {
	      return {
	      	//scrollY 在scroll方法中有设置
	        scrollY: -1, //滚动的纵向位置
	        currentIndex: 0, //当时显示的第几个索引（shortcutList列表）
	        diff: -1  // 固定标题和下一个标题的滚动差
	        //scrollY 改变时候动态改变diff的值
	        
	      }
	    },
		computed:{
			 shortcutList() {
			 	//group 获取到的每一个对象
		        return this.data.map((group) => {
		        	//从0开始，截取一个字符
		          return group.title.substr(0, 1)
		        })
		     },
		     
		     fixedTitle(){
		     	// data 一开始默认是空数组，所以没有值
		     	if (this.scrollY > 0) {
		          return ''
		        }
		    	return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
		     }
		},
		//数据变化监听
		watch:{
			//当data 数据发生变化时候触发
			data(){
				//延时变化，原因是数据的变化到dom的变化需要一个时间的过程
				setTimeout(() => {
						//数据渲染完成，重新计算高度
					this._calculateHeight()
				},20)
			},
			scrollY(newY) {
				
		        const listHeight = this.listHeight
		     //   console.log(newY)
		        
		        // 当滚动到顶部，newY>0
		        if (newY > 0) {
		          this.currentIndex = 0
		          return
		        }
		        // 在中间部分滚动
		        // listHeight.length - 1 是保证height2一定有值
		        for (let i = 0; i < listHeight.length - 1; i++) {
		          let height1 = listHeight[i]
		          let height2 = listHeight[i + 1]
		          // newY 小于0 ，-newY 大于0
		          if (-newY >= height1 && -newY < height2) {
		            this.currentIndex = i
		            // newY 是负数
		            this.diff = height2 + newY // 得到固定标题和下一个标题的滚动差
		          //	console.log(this.currentIndex)
		            return
		          }
		        }
		        // 当滚动到底部，且-newY大于最后一个元素的上限
		        this.currentIndex = listHeight.length - 2
		    },
		    diff(newVal) {
		    	//向上偏移
		        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
		        
		        // fixedTop 不需要修改 （固定标题和下一个标题滚动差大于一个列表的高度）
		        if (this.fixedTop === fixedTop) {
		          return
		        }
		        //this.fixedTop = fixedTop
		        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
		    }
				
		},
		methods:{
			refresh() {
		        this.$refs.listview.refresh()  //调用scroll的重新刷新渲染
		    },
			selectItem(item){  
				this.$emit('select',item)
			},
			scroll(pos){ //pos 是scroll 组件派发的参数
				this.scrollY = pos.y
			},
			
			//计算第一个滚动列表滚动的高度
			_calculateHeight(){
				this.listHeight = []//每个列表类别的高度
				const list = this.$refs.listGroup //得到每个类别				
        		let height = 0
        		//设置第一组类别的高度为0
        		this.listHeight.push(height) 
        		//循环设置剩下的类别所在位置的高度
        		for(let i=0;i<list.length;i++){
        			let item =list[i]
        			height += item.clientHeight
        			this.listHeight.push(height)
        		}
			},
			
			onShortcutTouchStart(event){
				 let anchorIndex = getData(event.target, 'index')
				 
				 let firstTouch = event.touches[0] //第一个触摸点
       			 this.touch.y1 = firstTouch.pageY //得到第一次触摸的位置
       			 this.touch.anchorIndex = anchorIndex //记录是第几个索引
       			 
       			 console.log("touch:"+anchorIndex)
       			 this._scrollTo(anchorIndex)
			},
			onShortcutTouchMove(event){
				let firstTouch = event.touches[0]
		        this.touch.y2 = firstTouch.pageY
		        
		        // 向下取整，得到几个字母的间距差
		        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
		        //得出跳转到第几个索引位置
		        //this.touch.anchorIndex 是从属性上获取的，因此得到的数据类型是字符串
		        let anchorIndex =parseInt(this.touch.anchorIndex)+delta
		        
		      //  console.log("move:"+anchorIndex)
		        
		        this._scrollTo(anchorIndex)
			},
			_scrollTo(index){
				//如果点击快速列表的空白位置（因为点击事件加在父级上，所以会点击空白位置）
//				if (!index && index !== 0) {
//		          return
//		        }
//				
//				if (index < 0) {
//		          index = 0
//		        }else if (index > this.listHeight.length - 2) {
//       			 index = this.listHeight.length - 2
//      		}
				//手动更改scrollY的值
				this.scrollY = -this.listHeight[index]
				//实现联动第一个滚动条的效果
				this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
			}
		}
	}
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
