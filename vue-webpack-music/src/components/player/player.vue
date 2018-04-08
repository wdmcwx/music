<template>
	<div class="player" v-show="playlist.length>0">
		<transition name='normal'
			@enter="enter"
            @after-enter="afterEnter"
            @leave="leave"
            @after-leave="afterLeave">
            
			<div class="normal-player" v-show="fullScreen">
				<div class="background">
					<img width="100%"  height="100%" :src="currentSong.image"/>
				</div>
				<div class="top">
					<div class="back"  @click="back">
						<i class="icon-back"></i>
					</div>
					<h1 class="title" v-html="currentSong.name"></h1>
					<h2 class="subtitle" v-html="currentSong.singer"></h2>
				</div>
				<div class="middle"
					@touchstart.prevent="middleTouchStart"
            		@touchmove.prevent="middleTouchMove"
            	 	@touchend="middleTouchEnd"
				>
				
					<div class="middle-l" ref='middleL'>
						<div class="cd-wrapper" ref='cdWrapper'>
							<div class="cd" :class="cdCls">
								<img class="image" :src="currentSong.image"/>
							</div>
						</div>
						<div class="playing-lyric-wrapper">
			              <div class="playing-lyric">{{playingLyric}}</div>
			            </div>
					</div>
					<Scroll class="middle-r" ref='lyricList' :data='currentLyric && currentLyric.lines'>
						<div class="lyric-wrapper">
							<div v-if="currentLyric">
								<p ref='lyricLine'
									class="text"
									:class="{'current': currentLineNum ===index}"
									 v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
							</div>
						</div>
					</Scroll>
				</div>
				<div class="bottom">
					<div class="dot-wrapper">
		            	<span class="dot" :class="{'active':currentShow==='cd'}"></span>
		            	<span class="dot" :class="{'active':currentShow==='lyric'}"></span>
		        	</div>					
					<div class="progress-wrapper">
						<span class="time time-l">{{format(currentTime)}}</span>
						<div class="progress-bar-wrapper">
							<ProgressBar :percent='percent' 
								@percentChange='onProgressBarChange'
								@clickPercentChange='clickPercentChange'>
							</ProgressBar>
						</div>
						<span class="time time-r">{{format(currentSong.duration)}}</span>
					</div>
					<div class="operators">
						<div class="icon i-left" @click="changeMode">
							<i :class="iconMode"></i>
						</div>
						<div class="icon i-left" :class="disableCls"> 
							<i class="icon-prev" @click="prev"></i>
						</div>
						<div class="icon i-center" :class="disableCls">
							<i :class="playIcon" @click="togglePlaying"></i>
						</div>
						<div class="icon i-right" :class="disableCls">
							<i class="icon-next" @click="next"></i>
						</div>
						<div class="icon i-right">
							<i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
						</div>
					</div>
				</div>
			</div>
		</transition>
		<transition  name='mini'>
			<div class="mini-player" v-show="!fullScreen" @click="open">
				<div class="icon">
					<img width="40" height="40" :src="currentSong.image"  :class="cdCls"/>
				</div>
				<div class="text">
					<h2 class="name" v-html="currentSong.name"></h2>
					<p class="desc" v-html="currentSong.singer"></p>
				</div>
				
				<div class="control">
					<ProgressCircle :radius='radius' :percent='percent'>
						<i :class="miniIcon" @click.stop="togglePlaying" class="icon-mini"></i>
					</ProgressCircle>
				</div>
				<div class="control" @click.stop="showPlaylist">
		          <i class="icon-playlist"></i>
		        </div>
			</div>
		</transition>
		<Playlist ref="playlist"></Playlist>
		<audio :src="currentSong.url" ref='audio' 
			@canplay="ready" 
			@error="erro"
			@timeupdate="updateTime"
			@ended="end"
			></audio>
	</div>
</template>

<script>
	import {mapGetters, mapMutations, mapActions} from 'vuex'
	import animations from 'create-keyframe-animation'  //引入插件
	import {prefixStyle} from 'common/js/dom'
	import ProgressBar from 'base/progress-bar/progress-bar'
	import ProgressCircle from 'base/progress-circle/progress-circle'
	import {playMode} from 'common/js/config'
	import {shuffle} from 'common/js/util'
	import Lyric from 'lyric-parser'
	import Scroll from 'base/scroll/scroll'
	import Playlist from 'components/playlist/playlist'
	import {playerMixin} from 'common/js/mixin'
	const transform = prefixStyle('transform')
  	const transitionDuration = prefixStyle('transitionDuration')
  
	export default{
		mixins: [playerMixin],
		created(){
			this.touch={} //自定义一个触摸对象，用来关联左右滑动时候cd和歌词显示切换
		},
		data(){
			return{
				songReady:false , //   音频/视频 准备播放状态
				currentTime:0 ,// 当前歌曲播放时间
				radius:32 , //小播放器圆圈的半径
				currentLyric:null, //当前歌词对象
				currentLineNum:0, //当前歌词所在的行
				playingLyric:'',  //播放的歌词
				currentShow:'cd'  //当前是cd被选中，添加active样式
			}
		},
		components:{
			ProgressBar,ProgressCircle,Scroll,Playlist
		},
		computed:{
			percent(){
				//进度条移动的百分比
				// 因为音频地址获取有问题，因此currentTime一直是 0
				return this.currentTime/this.currentSong.duration
			},
			disableCls(){
				return this.songReady ? '' : 'disable'
			},
			cdCls(){
				return this.playing ? 'play' : 'play pause'
			},
			miniIcon(){
				return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
			},
			playIcon(){
				//动态切换播放暂停图片 (cd)
				return this.playing ? 'icon-pause' : 'icon-play'
			},
			...mapGetters([
		        'fullScreen',
		        'playing',
		        'currentIndex'
			])
		},
		methods:{
			middleTouchStart(e){
				this.touch.initiated = true
		        // 用来判断是否是一次移动
		        this.touch.moved = false
		        const touch = e.touches[0]
		        this.touch.startX = touch.pageX
		        this.touch.startY = touch.pageY
			},
			middleTouchMove(e){
				if (!this.touch.initiated) {
		          return
		        }
		        const touch = e.touches[0]
		        const deltaX = touch.pageX - this.touch.startX
		        const deltaY = touch.pageY - this.touch.startY
		        //因为在歌词部分是可以上下滚动的，当在纵轴上的偏差大于横轴上的偏差，不应该左右滑动
		        if (Math.abs(deltaY) > Math.abs(deltaX)) {
		          return
		        }
		        //左侧偏移位置
		        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
		        //this.$refs.lyricList 是一个vue组件，如果使用原生js的方法，使用$el
		        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
		        //滑动百分比
		        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
		        //设置滑动效果
		        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
				this.$refs.lyricList.$el.style[transitionDuration] = 0
				//修改cd部分动画效果
				this.$refs.middleL.style.opacity = 1 - this.touch.percent
       		    this.$refs.middleL.style[transitionDuration] = 0
			},
			middleTouchEnd(e){
				let offsetWidth
				let opacity
				//只需要滑动10%即可滑到目标位置
				if (this.currentShow === 'cd') {
					//这是一个从右向左滑动的过程
					 if (this.touch.percent > 0.1) { //向左滑动10%时候，直接显示歌词部分
					 	  offsetWidth = -window.innerWidth
				          opacity = 0
				          this.currentShow = 'lyric'
					 }else{//回归原位
					 	  offsetWidth = 0
            			  opacity = 1
					 }
				}else{ //从左向右滑动
					if (this.touch.percent < 0.9){ //向右滑动10%
						offsetWidth = 0
			            this.currentShow = 'cd'
			            opacity = 1
					}else {
			            offsetWidth = -window.innerWidth
			            opacity = 0
			        }
				}
				
				const time = 300
				this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
				//设置动画时间
				this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
				//修改cd部分动画
				this.$refs.middleL.style.opacity = opacity
		        this.$refs.middleL.style[transitionDuration] = `${time}ms`
		        this.touch.initiated = false
			},
			getLyric(){ //封装一个getLyric（）方法，用于歌词接口的请求解析调用
				this.currentSong.getLyric().then( (lyric) => { //lyric 是song.js中的getLyric()方法中resolve中的数据
					if (this.currentSong.lyric !== lyric) {  
			            return
			        }
					//this.currentLyric 新建歌词对象
					this.currentLyric = new Lyric(lyric,this.handleLyric)
					console.log(this.currentLyric) // 打印出格式化的歌词对象（Lyric ）
					if (this.playing) { //歌曲在播放状态
			            this.currentLyric.play()
			        }
				}).catch(() => {  //当获取歌词失败的时候，清空一些数据
		          this.currentLyric = null
		          this.playingLyric = ''
		          this.currentLineNum = 0
		        })
			},
			//handleLyric 这是一个回调函数，歌词每改变一行就会回调一下
			handleLyric({lineNum, txt}) {
		        this.currentLineNum = lineNum //当前播放的行号
		        //超过5行之后的歌词，需要跳动
		        if (lineNum > 5) {
		        	//lyricLine 指向P标签，每一行就由一个P标签包裹，即有很多个P标签
		         //lineEl 当前的元素（第几个P标签）
		          let lineEl = this.$refs.lyricLine[lineNum - 5]
		          //滚动到指定位置，1000毫秒的时间
		          this.$refs.lyricList.scrollToElement(lineEl, 1000)
		        } else {
		        	//在5行之内，直接滚动到顶部
		          this.$refs.lyricList.scrollTo(0, 0, 1000)
		        }
		        this.playingLyric = txt  //显示
		    },
			end(){ //当歌曲播放完之后，切换到下一首歌
				//根据播放模式，决定歌曲播放完成之后的处理
				if (this.mode === playMode.loop) {
		          this.loop() //循环播放
		        } else {
		          this.next() //切换到下一首歌曲
		        }
			},
			loop() {
		        this.$refs.audio.currentTime = 0 //将当前的播放时间进度切换为0
		        this.$refs.audio.play() //重新调用播放功能
		        this.setPlayingState(true) //已经准备好播放音频
		        //处理歌词部分
		        if (this.currentLyric) {
		          this.currentLyric.seek(0)  //currentLyric.seek(0)歌词的跳转
		        }
		     },
			
			clickPercentChange(percent){
				if (!this.playing) {
			         this.togglePlaying()
			    }
			},
			onProgressBarChange(percent){
				 const currentTime = this.currentSong.duration * percent
				 //根据进度条拖动的百分比 修改歌曲播放的进度百分比
				 this.$refs.audio.currentTime = currentTime
				 // 进度条拖动完成以后，如果之前是暂停状态，则修改播放状态成播放状态
				  if (!this.playing) {
			         this.togglePlaying()
			      }
				  
				  //处理歌词部分
				  if (this.currentLyric) {
			         this.currentLyric.seek(currentTime * 1000)
			       }
			},
			format(interval){
				//将时间戳格式化成相应的数据格式
				//向下取整
				interval=interval | 0
				// 获取分
				const minute=interval/60 | 0
				//获取秒   取余
				const second=this._pad(interval % 60 )
				return `${minute}:${second}`
			},
			//用0补位
			_pad(num ,n=2){ //n=2 ,将0补到几位
				let len=num.toString().length  //得到该数字的长度
				
				while(len<2){ //循环在前面 补 0
					num='0'+num
					len++
				}
				return num
			},
			updateTime(e){
				//audio中 currentTime 设置或返回音频/视频中的当前播放位置（以秒计）
				//此时 currentTime 是一个时间戳
				this.currentTime=e.target.currentTime
			},
			erro(){
				this.songReady=true   // 当出现错误时候，切换到下一首歌曲，重新将准备播放状态改变
			},
			ready(){
				this.songReady=true // 设置html音频/视频 已经准备好开始播放
				this.savaPlayHistory(this.currentSong) //写入播放历史数组中
			},
			prev(){
				//音频/视频没有准备好,则不允许歌曲切换
				if(!this.songReady){
					return
				}
				
				// 如果只有一首歌曲
				if(this.playlist.length==1){
					this.loop()  //循环播放
					return
				}else{
					let index=this.currentIndex-1
					if(index===-1){
						index=this.playlist.length-1
					}
					//重新设置当前歌曲索引
					this.setCurrentIndex(index)
					//切换下一首歌曲，如果当前为暂停状态，则切换下一曲歌曲就要改变播放状态
					if(!this.playing){
						this.togglePlaying()
					}
				}
				//改变可播放状态
				this.songReady=false
			},
			next(){
				//音频/视频没有准备好,则不允许歌曲切换
				if(!this.songReady){
					return
				}
				// 如果只有一首歌曲
				if(this.playlist.length==1){
					this.loop()  //循环播放
					return
				}else{
					let index=this.currentIndex+1
					if(index===this.playlist.length){
						//当到最后一首歌的时候,重新从第一首歌开始
						index=0
					}
					//重新设置当前歌曲索引
					this.setCurrentIndex(index)
					//切换下一首歌曲，如果当前为暂停状态，则切换下一曲歌曲就要改变播放状态
					if(!this.playing){
						this.togglePlaying()
					}
				}
				//改变可播放状态
				this.songReady=false
			},
			togglePlaying(){
				this.setPlayingState(!this.playing)
				//暂停和播放状态与歌词的暂停与播放相关联
				if (this.currentLyric) {
		          this.currentLyric.togglePlay()
		        }
			},
			enter(){ // 设置动画帧数
				const {x,y,scale} = this._getPosAndScale()
				let animation = {
		          0: {
		            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
		          },
		          60: {
		            transform: `translate3d(0,0,0) scale(1.1)`
		          },
		          100: {
		            transform: `translate3d(0,0,0) scale(1)`
		          }
		          
		        }
				//注册动画
				animations.registerAnimation({
					name: 'move', // 插入自定义的动画
		         	animation,// 参数配置
		            presets: {
		            duration: 400,
		            easing: 'linear'
		          }
				})
				// 执行动画， done是一个回调函数，当回调函数调用完成自动调用afterEnter方法
				animations.runAnimation(this.$refs.cdWrapper, 'move', done)
			},
			afterEnter(el,done){  // 取消动画
				animations.unregisterAnimation('move')
       			this.$refs.cdWrapper.style.animation = ''
			},
			leave(el,done){ // 两个参数： 元素 ，回调函数 （当回调函数执行时候，就会跳入下一个钩子函数执行（afterLeave））
				this.$refs.cdWrapper.style.transition = 'all 0.4s'
		        const {x, y, scale} = this._getPosAndScale()
		        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
		      // 添加自定义监听事件
		        this.$refs.cdWrapper.addEventListener('transitionend', done)
			},
			afterLeave(){
				this.$refs.cdWrapper.style.transition = ''
        		this.$refs.cdWrapper.style[transform] = ''
			},
			back(){
				this.setFullScreen(false)
			},
			open(){
				this.setFullScreen(true)
			},
			showPlaylist() {
		        this.$refs.playlist.show()
	       },
			_getPosAndScale() {
		        const targetWidth = 40  //目标宽度 （mini图片的宽度）
		        const paddingLeft = 40 //mini图片中心点距离左边40px
		        const paddingBottom = 30 //mini图片中心点距离底部30px
		        const paddingTop = 80 //大图片中心点距离顶部80px
		        const width = window.innerWidth * 0.8  // 得到cd容器的宽度
		        // 缩放比例：mini/big
		        const scale = targetWidth / width   
		        // (0,0)中心点在大图的中心
		        const x = -(window.innerWidth / 2 - paddingLeft)
		        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
		        return {
		          x,
		          y,
		          scale
		        }
			
			},
			...mapMutations({
				setFullScreen:'SET_FULL_SCREEN',
			}),
			...mapActions([
				'savaPlayHistory'
			])
		},
		watch:{
			currentSong(newSong, oldSong){
				if (!newSong.id) { //没有下一首歌曲了
		          return
		        }
		        if (newSong.id === oldSong.id) {
		          return
		        }
		        
		        if (this.currentLyric) {  //如果有播放的歌曲
		         	 this.currentLyric.stop() //停止歌曲
		        }
		        
		        clearTimeout(this.timer) //保证只执行一次setTimeout
				this.timer=setTimeout(() => {
		        //   newPlaying ? audio.play() : audio.pause()
		        	this.$refs.audio.play()
		        	this.getLyric() // 调用歌词接口请求方法
		         },1000)
			},
			playing(newPlaying){
				 const audio = this.$refs.audio  //给原先的audio做缓存
		         this.$nextTick(() => {
		           newPlaying ? audio.play() : audio.pause()
		         })
			}
		}
	}
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>