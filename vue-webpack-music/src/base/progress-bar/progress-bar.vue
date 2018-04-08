<template>
	<div class="progress-bar" ref='progressBar' @click="progressClick">
		<div class="bar-inner">
			<div class="progress" ref='progress'></div>
			<div class="progress-btn-wrapper" ref='progressBtn'
				@touchstart.prevent="progressTouchStart"
                @touchmove.prevent="progressTouchMove"
                @touchend="progressTouchEnd"
			>
				<div class="progress-btn"></div>
			</div>
		</div>
	</div>
</template>

<script>
	import {prefixStyle} from 'common/js/dom'
	const transform = prefixStyle('transform')
	// 定义进度条上小球的宽度 (样式中有设置)
	const progressBtnWidth=16
	
	export default{
		created(){
			this.touch={} //该对象用来挂载共享一些数据
		},
		props:{
			percent:{  //百分比
				type:Number,
				default:0
			}
		},
		watch:{
			percent(newPercent){
				// !this.touch.initiated 表示不是在拖动的过程中
				if(newPercent>=0 && !this.touch.initiated){  
					//计算整个进度条的宽度（progress-bar 的宽度） ----》 总的progressBar宽度减去小球的宽度
					const barWidth=this.$refs.progressBar.clientWidth-progressBtnWidth
					//偏移的宽度
					const offsetWidth=newPercent*barWidth
					//设置进度条各个元素的位置
					this._offset(offsetWidth)
				}
			}
		},
		methods:{
			progressClick(e) {
		      	//得到progressBar 相对于视窗的位置集合
		        const rect = this.$refs.progressBar.getBoundingClientRect()
		        const offsetWidth = e.pageX - rect.left  //得到黄色区域的宽度
		        this._offset(offsetWidth)
		        // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
		        // this._offset(e.offsetX)
		        //e.offsetX：鼠标相对于事件源的X方向的距离( firfox 不支持)
		        this._triggerPercent()
		    },
		    _triggerPercent() {
		        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
		        const percent = this.$refs.progress.clientWidth / barWidth
		        this.$emit('percentChange', percent)
		    },
			progressTouchStart(e){
				this.touch.initiated=true //表示已经初始化
				this.touch.startX=e.touches[0].pageX //第一根手指横向坐标
				//this.touch.startY=e.touchs[0].pageY
				this.touch.left=this.$refs.progress.clientWidth //黄色区域的宽度（进度宽度）
			},
			progressTouchMove(e){
				if(!this.touch.initiated){ //没有进入progressTouchStart 直接进入progressTouchMove事件
					return 
				}
				//计算移动的距离
				const deltaX=e.touches[0].pageX-this.touch.startX
				//重新计算黄色区域的宽度    (不能小于0,不能大于整个进度条的宽度)
				const offsetWidth=Math.min(this.$refs.progressBar.clientWidth-progressBtnWidth,Math.max(0,this.touch.left+deltaX))
				//设置进度条各个元素的位置
				this._offset(offsetWidth)
			},
			progressTouchEnd(e){
				this.touch.initiated=false
				this._triggerPercent()  //向父级派发一个事件，告诉父级进度条的进度百分比
			},
			_triggerPercent(){
				//计算整个进度条的宽度（progress-bar 的宽度） ----》 总的progressBar宽度减去小球的宽度
				const barWidth=this.$refs.progressBar.clientWidth-progressBtnWidth
				const progressWidth=this.$refs.progress.clientWidth //黄色区域的宽度（进度宽度）
				const percent=progressWidth / barWidth
				//向父组件派发进度百分比通知
				this.$emit('percentChange',percent)
			},
			_offset(offsetWidth){ //设置进度条各个部分相应的位置
				//设置 progress的宽度 （黄色区域的宽度）
				this.$refs.progress.style.width=`${offsetWidth}px`
				//设置小球的偏移
				this.$refs.progressBtn.style[transform]=`translate3d(${offsetWidth}px,0,0)`
			}
		}
	}
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>