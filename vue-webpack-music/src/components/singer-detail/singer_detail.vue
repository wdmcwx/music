<template>
	<transition name="slide">
		<music_list :songs='songs' :title='title' :bgImage='bgImage'></music_list>
	</transition>
</template>

<script>
	import {mapGetters} from 'vuex'
	import {getSingerDetail} from '@/api/singer'
	import {ERR_OK} from 'api/config'
	import {createSong} from '@/common/js/song'
	import music_list from '@/components/music-list/music-list'
	export default{
		components:{
			music_list
		},
		 data(){
		 	return {
		 		songs:[]	
		 	}
		 },
		 computed: {
		 	title(){
		 		return this.singer.name
		 	},
		 	bgImage(){
		 		return this.singer.avatar
		 	},
		 	...mapGetters([  //取出state中的值
		        'singer'   //得到了getters.js中的singer
		    ])
		 },
		 created(){
		 	this._getDetail()
		 //	console.log(this.singer)
		 },
		 methods:{
		 	_getDetail(){
		 		//如果找不到相应的歌手 id，就重新进行路由跳转
		 		if(!this.singer.id){
		 			this.$router.push('/singer')
		 			//return
		 		}
		 		getSingerDetail(this.singer.id).then((res) => {
		 			if(res.code==ERR_OK){
		 			//	console.log(res.data.list)
		 				this.songs=this._normalizeSongs(res.data.list)
		 			//	console.log(this.songs)
		 			}
		 		})
		 	},
		 	_normalizeSongs(list){
		 		let ret=[]
		 		list.forEach((item) => {
		 			//es6的解构赋值。大括号中的key对应item的key  其值也是相对应的
		 			let {musicData}=item  // 得到musicData
		 			
		 			//有图片地址和歌曲播放地址，才在自定义数组中加入实例
		 			if(musicData.songid && musicData.albummid){	
		 				ret.push(createSong(musicData)) //动态传入数组数据
		 			}
		 		})
		 		return ret; //将song返回
		 	}
		 }
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
   

</style>