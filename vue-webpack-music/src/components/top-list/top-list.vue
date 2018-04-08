<template>
	<transition name="slide">
	    <music-list  :title="title" :bg-image="bgImage" :songs="songs" :rank='rank'></music-list>
	</transition>
</template>

<script>
  import MusicList from 'components/music-list/music-list'
  import {getMusicList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import {mapGetters} from 'vuex'
  import {createSong} from 'common/js/song'
  
  export default {
  	components: {
      MusicList
    },
    created() {
      this._getMusicList()
    },
    computed: {
    	title() {
       		return this.topList.topTitle
	    },
	    bgImage() {
	        if (this.songs.length) {
	          return this.songs[0].image  //第一首歌曲的图片
	        }
	        return ''
			//return this.topList.picUrl
	    },
    	...mapGetters([
	        'topList'  //得到toplist的数据
	    ])
    },
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    methods:{
    	_getMusicList() {
	        if (!this.topList.id) {  //如果该id不存在，就会跳转到rank
	          this.$router.push('/rank')
	          return
	        }
	        getMusicList(this.topList.id).then((res) => {
	          if (res.code === ERR_OK) {
	              this.songs = this._normalizeSongs(res.songlist)
	         	 // this.songs = res.songlist
	         	//  console.log('---------------------')
	        // 	  console.log(this.songs)
	          }
	        })
	    },
	    _normalizeSongs(list) {  //将从接口获得的数据转成song的实例
	        let ret = [] //定义一个数组
	        list.forEach((item) => { //遍历对象
	          const musicData = item.data
	          if (musicData.songid && musicData.albummid) { //同时存在这两个字段
	            ret.push(createSong(musicData))  //往数组中添加数据
	          }
	        })
	        return ret
	    },
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>