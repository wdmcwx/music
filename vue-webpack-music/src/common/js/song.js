import {getLyric} from 'api/song'  
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'

export default class Song {
	//构造函数
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer //歌手
    this.name = name //名称
    this.album = album //专辑
    this.duration = duration  //歌曲的长度
    this.image = image		//歌曲的图片
    this.url = url				//歌曲的地址
  }
//封装一个调用歌词接口的方法，该方法是song的一个属性
  getLyric() {
    if (this.lyric) {
    	// 只有在song发生改变的时候会调用该方法进行接口请求，因为 getLyric（）返回的是一个 Promise.resolve，
    	//所以此处也要return一个 Promise.resolve
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
        	// this.lyric  自定义的属性
          this.lyric = Base64.decode(res.lyric)
         // console.log(this.lyric )   //得到歌词部分
          resolve(this.lyric) //Resolve另一个promise对象
        } else {
          reject('no lyric')
        }
      })
    })
  }
 
}

//这是一个 工厂方法
export function createSong(musicData) {
	
  return new Song({  // 返回一个song对象
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer), //调用filterSinger方法
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
    // http://ws.stream.qqmusic.qq.com/C100 001J5QJL1pRQYB.m4a?fromtag=38
    //ws.stream.qqmusic.qq.com/C100 003OUlho2HcRHC.m4a?fromtag=38
  })
}

// 过滤 拼凑歌手
function filterSinger(singer) {
  let ret = []
  if (!singer) {  // 如果传递一个空值
    return ''  // 返回空值
  }
  singer.forEach((s) => {
    ret.push(s.name)  // 将数据加入数组
  })
  return ret.join('/')  //将数组中的元素，按照指定字符进行连接
}

