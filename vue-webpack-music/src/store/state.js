import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
	singer: {},
	playing: false,
    fullScreen: false,  //全屏与否
  	playlist: [],		//当前播放列表
  	sequenceList: [], //顺序列表
  	mode: playMode.sequence, //顺序播放模式 
  	currentIndex: -1, // 当前播放索引
  	
  	disc:{}, //歌单对象
  	topList: {},// 排行榜对象
 	searchHistory: loadSearch(), // 搜索历史（初始值都是从本地缓存中取得）
 	playHistory: loadPlay() ,//播放历史
 	favoriteList:loadFavorite() // 收藏列表
} 

export default state