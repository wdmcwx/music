<template>
	<transition name='slide'>
		<div class="user-center">
			<div class="back" @click="back">
				<i class="icon-back"></i>
			</div>
			<div class="switches-wrapper">
				<Switches :currentIndex='currentIndex' :switches='switches' @switch='switchItem'></Switches>
			</div>
			<div class="play-btn" ref='playBtn' @click="random">
				<i class="icon-play"></i>
				<span class="text">随机播放全部</span>
			</div>
			<div class="list-wrapper" ref='listWrapper'>
					<Scroll ref='FavoriteList' v-if='currentIndex===0' :data='favoriteList'  class='list-scroll' >
						<div class="list-inner">
							<SongList :songs='favoriteList' @select='selectSong'></SongList>
						</div>
					</Scroll>
					<Scroll ref='playList' v-if='currentIndex===1' :data='playHistory'  class='list-scroll' >
						<div class="list-inner">
							<SongList :songs='playHistory' @select='selectSong'></SongList>
						</div>
					</Scroll>
			</div>
			<div class="no-result-wrapper" v-show="noResult">
				<NoResult :title='noResultDesc'></NoResult>
			</div>
		</div>
	</transition>
</template>

<script>
	import Switches from 'base/switches/switches'
	import Scroll from 'base/scroll/scroll'
	import {mapGetters, mapActions} from 'vuex'
	import SongList from 'base/song-list/song-list'
  	import NoResult from 'base/no-result/no-result'
  	import Song from 'common/js/song'
  	import {playlistMixin} from 'common/js/mixin'
  	
	export default {
		mixins: [playlistMixin],
		data(){
			return{
				switches:[
					{name:'我喜欢的'},
					{name:'最近听的'}
				],
				currentIndex:0,
				
			}
		},
	 	components:{
	 		Switches,SongList,Scroll,NoResult
	 	},
	 	methods:{
	 		handlePlaylist(playlist) {
		        const bottom = playlist.length > 0 ? '60px' : ''
		        this.$refs.listWrapper.style.bottom = bottom
		        //先判断favoriteList，playList是否存在，在进行刷新操作
		        this.$refs.favoriteList && this.$refs.favoriteList.refresh()
		        this.$refs.playList && this.$refs.playList.refresh()
		    },
	 		switchItem(index){
	 			this.currentIndex=index
	 		},
	 		back(){
	 			this.$router.back()
	 		},
	 		selectSong(song){ //选择一首歌曲，实现该歌曲插入播放列表
	 			this.insertSong(new Song(song)) // 实例化成Song对象
	 		},
	 		random(){  //随机播放
	 			let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
		        if (list.length === 0) {
		          return
		        }
		        list = list.map((song) => {  //map : 返回一个由原数组中的每个元素调用一个指定方法后的返回值组成的新数组
		          return new Song(song)  //将数组中的每个元素都实例化成song实例
		        })
		        this.randomPlay({
		          list
		        })
	 		},
	 		...mapActions([
		        'insertSong',
		        'randomPlay'
		    ])
	 	},
	 	computed:{
	 		noResult(){
	 			if(this.currentIndex==0){
	 				return !this.favoriteList.length
	 			}else{
	 				return !this.playHistory.length
	 			}
	 		},
	 		noResultDesc(){
	 			if(this.currentIndex==0){
	 				return '暂无收藏歌曲'
	 			}else{
	 				return '你还没有听过歌曲'
	 			}
	 		},
	 		...mapGetters([
		        'favoriteList',  //收藏列表
		        'playHistory'	//播放列表
		    ])
	 	}
	}
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
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
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
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
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>