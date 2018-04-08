import storage from 'good-storage'   //导入插件

//用来操作state中的数据

// 定义key
//搜索的key
const SEARCH_KEY = '__search__'
//最大存储数量
const SEARCH_MAX_LEN = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

function insertArray(arr, val, compare, maxLen) {
	// 参数顺序： 存储的数组，存的值，定义一个比较函数，存的最大值
  const index = arr.findIndex(compare) //在数组中查找符合函数条件的元素的索引
  if (index === 0) {  // 第一条数据
    return
  }
  if (index > 0) { //数组中存在该数据，且不是在最前面
    arr.splice(index, 1)
  }
  arr.unshift(val)		//将新的数据存放到数组的最前面
  
  if (maxLen && arr.length > maxLen) { //如果限制大小数组存在，且数组的长度大于缓存数量
    arr.pop()  //删除数组中的最后一个元素
  }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)  //删除指定位置的元素
  }
}

export function saveSearch(query) { //query表示存储的值
	// 根据key得到缓存的内容，get的第二个参数是默认返回的缓存数据（即：如果没有存储过，就返回一个空数组）
  let searches = storage.get(SEARCH_KEY, [])
  //将query插入到数组中，数组最大存储15条数据，当超过15条就会清空数组后面的数据。插入的数据放在数组的前面。如果数组中有重复的数据，需要将旧的数据删除，再将新的数据插入到前面。
  insertArray(searches, query, (item) => { //item 是指数组中的每一个元素
    return item === query
  }, SEARCH_MAX_LEN)
  storage.set(SEARCH_KEY, searches) //将数组存入到缓存中
  return searches //返回一个新的数组
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])  //从缓存中获取数据
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)  //重新设置缓存
  return searches //返回一个新的数组
}

export function clearSearch() {
  storage.remove(SEARCH_KEY) //删除所有缓存
  return [] //返回一个空数组
}

//加载本地缓存的搜索历史
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}
//保存播放历史
export function savePlay(song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function loadPlay() {
  return storage.get(PLAY_KEY, [])
}

export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, []) //得到该类型的数组数据
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, []) 
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}

