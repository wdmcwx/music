import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch,deleteSearch,clearSearch,savePlay, saveFavorite, deleteFavorite} from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex((item) => {
  	//item就是list中的每一个元素，song是其中的一个元素
    return item.id === song.id  //返回找到符合条件的索引
  })
}

// 修改mutation中的值 ，并提交。   修改的键-------修改的值
//这是顺序播放
export const selectPlay = function ({commit, state}, {list, index}) {
	// index 是顺序播放列表中的索引
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) { //如果当前的播放模式是随机播放模式
    let randomList = shuffle(list)  //打乱播放列表
    commit(types.SET_PLAYLIST, randomList) //重新设置播放列表
    //找到顺序列表中的索引对应的随机列表中的索引
    index = findIndex(randomList, list[index]) //重新设置歌曲索引
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)//设置播放歌曲索引
  commit(types.SET_FULL_SCREEN, true)//全屏打开播放器
  commit(types.SET_PLAYING_STATE, true) //打开播放状态
}

//随机播放
export const randomPlay = function ({commit}, {list}) {
	commit(types.SET_PLAY_MODE, playMode.random) //设置播放模式为随机播放
	commit(types.SET_SEQUENCE_LIST, list)
	let randomList = shuffle(list) //打乱播放列表
	commit(types.SET_PLAYLIST, randomList)
	commit(types.SET_CURRENT_INDEX, 0)// 重新设置歌曲索引（从打乱的歌曲列表中第一个开始播放）
	commit(types.SET_FULL_SCREEN, true)
	commit(types.SET_PLAYING_STATE, true) 
}

// commit, state 拿到这些方法
export const insertSong = function ({commit, state}, song) {
	//从state中拿到相应的数据
  let playlist = state.playlist.slice() //复制playlist数组，进行相关操作，避免直接对playlist进行操作
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)  //如果有结果返回其索引，否则返回-1
  // 因为是插入歌曲，所以索引+1
  currentIndex++
  // 插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 如果已经包含了这首歌 ，就要删除之前存在的那个索引
  if (fpIndex > -1) {
    // 如果当前插入的序号大于列表中的序号
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)   //删掉之前列表中的索引
      currentIndex--  //因为整个数组长度已经减一，因此当前索引也要减一
    } else {
      playlist.splice(fpIndex + 1, 1) //因为前面已经进行数组+1，因此要删除原来存在的索引就要加一
    }
  }
//查找当前歌曲在sequenceList列表中的位置，加一就是要插入的位置
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
//查找sequenceList中是否有要插入的歌曲
  let fsIndex = findIndex(sequenceList, song)
//sequenceList插入一首歌曲
  sequenceList.splice(currentSIndex, 0, song) 

  if (fsIndex > -1) { //如果sequenceList存在要插入的歌曲，就要删除已经存在的歌曲
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)//删掉之前列表中的索引
    } else {
      sequenceList.splice(fsIndex + 1, 1)//因为前面已经进行数组+1，因此要删除原来存在的索引就要加一
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

//插入保存工作
export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
//删除指定项
export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

//清空所有的缓存
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}


export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice() //相当于拷贝一个副本
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song) //得到song在playlist中的索引
  playlist.splice(pIndex, 1) //删除指定索引的歌曲
  let sIndex = findIndex(sequenceList, song)//得到song在sequenceList中的索引
  sequenceList.splice(sIndex, 1)//删除指定索引的歌曲
  //播放的歌曲在删除歌曲之后，或者删除的是最后一首歌
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }

//提交mutations
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
 // 根据播放列表中是否有歌曲判断播放的状态
  const playingstate=playlist.length>0
  commit(types.SET_PLAYING_STATE, playingstate)
  
//设置播放状态
//if (!playlist.length) {
//  commit(types.SET_PLAYING_STATE, false)
//} else {
//  commit(types.SET_PLAYING_STATE, true)
//}
}

//清空播放列表
export const deleteSongList = function ({commit}) {
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_PLAYING_STATE, false)
}
//
//export const deleteSongList = function ({commit}) {
//commit(types.SET_CURRENT_INDEX, -1)
//commit(types.SET_PLAYLIST, [])
//commit(types.SET_SEQUENCE_LIST, [])
//commit(types.SET_PLAYING_STATE, false)
//}

// savaPlayHistory 保存播放历史
export const savePlayHistory = function ({commit}, song) {
commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function ({commit}, song) {
commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}
export const deleteFavoriteList = function ({commit}, song) {
commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
