<template>
	<div class="music-list">
		<div class="back" @click="back">
			<i class="icon-back"></i>
		</div>
		<h1 class="title" v-html="title"></h1>
		<div class="bg-image" :style='bgStyle' ref="bgImage">
			<div class="play-wrapper" >
				<div class="play" v-show="songs.length>0" ref='playBtn' @click="random">
					<i class="icon-play"> </i>
					<span class="text"> 随机播放全部</span>
				</div>
			</div>
			<div class="filter" ref='filter'> </div>
		</div>
		<div class="bg-layer" ref='layer'></div>
		<Scroll :data='songs' class="list" ref="list" 
			:probeType='probeType' 
			:listenScroll='listenScroll'
			@scroll='scroll'>
			<div class="song-list-wrapper">
				<SongList :songs='songs' @select='selectItem' :rank='rank'></SongList>
			</div>
			<div class="loading-container" v-show="!songs.length">
				<Loading ></Loading>
			</div>
			
		</Scroll>
	</div>
</template>

<script>
	import Scroll from 'base/scroll/scroll'
	import SongList from 'base/song-list/song-list'
	import {prefixStyle} from 'common/js/dom'
    import {playlistMixin} from 'common/js/mixin'
    import {mapActions} from 'vuex'
    import Loading from 'base/loading/loading'
    
	const RESERVED_HEIGHT = 40
  	const transform = prefixStyle('transform')
 	const backdrop = prefixStyle('backdrop-filter')
  
	export default{
		mixins: [playlistMixin],  //插入 混入对象（minxis）
		data(){
			return {
				scrollY:0
			}
		},
		methods:{
			handlePlaylist(playlist){ //实现mixins中的handlePlaylist方法
				//如果有歌曲，就设置scroll的bottom的高度
				const bottom = playlist.length > 0 ? '60px' : '' 
		       //动态设置scroll的底部高度
		        this.$refs.list.$el.style.bottom = bottom
		        //刷新scroll的渲染，让其重新计算
		        this.$refs.list.refresh()
			},
			random(){ //随机播放歌曲
				this.randomPlay({
					list:this.songs, //list是全部的歌曲				
				})
			},
			scroll(pos){
				this.scrollY=pos.y
			},
			back() {
		        this.$router.back()
		    },
		    selectItem(item ,index){ //song-list组件派发出来的参数
		    	//item 表示的是一首歌
		    	this.selectPlay({ //调用action中的 selectPlay设置mutation中的多个属性值
		    		list:this.songs, //list是全部的歌曲
		    		index:index
		    	})
		    },
		    ...mapActions([
		    	'selectPlay', //选择性播放设置
		    	'randomPlay'  //随机播放设置
		    ])
		},
		watch:{
			scrollY(newY){
				//设置layer滚动范围
				let translateY = Math.max(this.minTransalteY, newY)
				// 设置bgImage层级
				let zIndex=0
				//设置模糊倍数
				let blur=0
				
				//设置图片放大倍数
				let scale=1 
			//向下滚动newY大于0 ，向下滚动 newY小于0.不滚动 newY=0
			//	console.log(newY)
			
				//滚动比例
			    const percent=Math.abs(newY/this.imageHeight)
			//    console.log(percent)
			    
				if(newY>0){ //如果向下拉
					scale=1+percent
					//提高bgImage层级
					zIndex=10
				}else{ //向上滚动，背景图片要变得越来越模糊
					//Math.min 返回一组值的最大值
					blur=Math.min(20*percent,20)
				}
				//设置高斯模糊（苹果手机可以看到）
				this.$refs.filter.style['backdrop-filter'] = `blur(${blur}px)`
				this.$refs.filter.style['webkitBackdrop-filter'] = `blur(${blur}px)`
				//设置layer运动偏移
				//translate3d是CSS3的一个新的css属性。
				this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0)`
				this.$refs.layer.style['webkitTransform']=`translate3d(0,${translateY}px,0)`
					
				//如果layer滚动到顶部，提高图片的层级
				if(newY<this.minTransalteY){
					zIndex=10
					this.$refs.bgImage.style.paddingTop = 0
          			this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          			//修改btn的显示隐藏
          			this.$refs.playBtn.style.display='none'
				}else{
					this.$refs.bgImage.style.paddingTop = '70%'
          			this.$refs.bgImage.style.height = 0
          			this.$refs.playBtn.style.display=''
				}
				this.$refs.bgImage.style['transform'] = `scale(${scale})`
				this.$refs.bgImage.style['webkitTransform'] = `scale(${scale})`
				this.$refs.bgImage.style.zIndex = zIndex
			}
		},
		props:{
			bgImage:{
				type:String,
				default:''
			},
			songs:{
				type:Array,
				default:[]
			},
			title:{
				type:String,
				default:''
			},
			rank: {  //是否需要显示排行图标
		        type: Boolean,
		        default: false  
		    }
		},
		components:{
			Scroll,
			SongList,
			Loading
		},
		computed:{
			bgStyle() { //动态设置背景
		      return `background-image:url(${this.bgImage})`
		    }
		},
		mounted() {
	      this.imageHeight = this.$refs.bgImage.clientHeight
	      
	  //    console.log("imageHeight:"+this.imageHeight) //261
	      
	      this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT
	      //设置list样式的高度
	      this.$refs.list.$el.style.top = `${this.imageHeight}px`
	    },
	    created(){
	    	this.probeType = 3
      		this.listenScroll = true
	    }
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
  
</style>