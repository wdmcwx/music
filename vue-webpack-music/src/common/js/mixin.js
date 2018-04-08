import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

//自定义一个混入对象
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {  //具体实现不在这里实现
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'playlist',
      'currentSong',
      'mode',
      'favoriteList'
    ])
	},
methods: {
    changeMode() {
      const mode = (this.mode + 1) % 3 //切换歌曲播放模式 (一共有3种播放模式)
      this.setPlayMode(mode) //重新设置播放模式
      let list = null
      if (mode === playMode.random) { //打乱顺序列表
        list = shuffle(this.sequenceList)
      } else { //其他播放模式
        list = this.sequenceList 
      }
      this.resetCurrentIndex(list)////重新设置播放索引
      this.setPlaylist(list) ////重新设置播放列表
    },
    //当切换播放模式时候，会重新设置播放列表。此时不希望当前的CurrentIndex改变，因此将CurrentIndex设置与之前的一样
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteList(song)
      } else {
        this.saveFavoriteList(song)
      }
    },
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
 }
}

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 120
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    onQueryChange(query) { //搜索框内数据发生改变 ,请求服务器得到数据
      this.query = query
    },
    blurInput() {//scroll组件开始滚动时候，input失去焦点
      this.$refs.searchBox.blur() //调用子组件的方法
    },
    addQuery(query) { //将关键词添加到搜索框中，调用SearchBox中的setQuery方法
      this.$refs.searchBox.setQuery(query)
    },
    saveSearch() {//保存搜索历史
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
      'clearSearchHistory'
    ])
  }
}
