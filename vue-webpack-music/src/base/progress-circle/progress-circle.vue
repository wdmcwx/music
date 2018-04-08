<template>
	<div class="progress-circle">
		<!--viewBox="0 0 100 100" 是一个视口的区域，从（0，0）到（100，100）-->
		<svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
	      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
	    <!--  stroke-dasharray 周长，stroke-dashoffset 偏移量-->
	      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
	              :stroke-dashoffset="dashOffset"/>
	    </svg>
	    <slot></slot>
	</div>
</template>

<script>
	export default {
	    props: {
	      radius: {
	        type: Number,
	        default: 100
	      },
	      percent: {
	        type: Number,
	        default: 0
	      }
	    },
	    data() {
	      return {
	        dashArray: Math.PI * 100  //周长：2*pi*R
	      }
	    },
	    computed:{
	    	dashOffset() {
		       return (1 - this.percent) * this.dashArray  //计算出偏移量
		    }
	    },
	    watch:{
	    }
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
  
  .progress-bar{
  	background: #2C3E50;
  }
</style>