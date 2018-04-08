<template>
	<Scroll class="suggest" 
		:data="result" 
		:pullup='pullup'
		ref='suggest'
		:beforeScroll="beforeScroll"
		@scrollToEnd='searchMore'
		@beforeScroll="listScroll"
		>
		<ul class="suggest-list">
			<li class="suggest-item" 
				v-for="( item ,index) in result"
				@click="selectItem(item)">
				<div class="icon">
					<i :class="getIconCls(item)"></i>
				</div>
				<div class="name">
		          <p class="text" v-html="getDisplayName(item)"></p>
		        </div>
			</li>
			<loading v-show="hasMore" title=""></loading>
		</ul>
		<div v-show="!hasMore && !result.length" class="no-result-wrapper">
	      <NoResult title="抱歉，暂无搜索结果"></NoResult>
	    </div>
	</Scroll>
</template>

<script>
	import {search} from 'api/search'
	import {ERR_OK} from 'api/config'
	import {createSong} from 'common/js/song'
	import Scroll from 'base/scroll/scroll'
  	import Loading from 'base/loading/loading'
  	import NoResult from 'base/no-result/no-result'
  	import Singer from 'common/js/singer'
  	import {mapMutations, mapActions} from 'vuex'
  	
	const TYPE_SINGER = 'singer'
  	const perpage = 30
  
	export default {
		components:{
			Scroll,Loading,NoResult
		},
	    props: {
	      showSinger: {
	        type: Boolean,
	        default: true
	      },
	      query: {
	        type: String,
	        default: ''
	      }
	    },
	    data() {
	      return {
	        page: 1,  //第几页
	        pullup: true, //设置scroll组件上拉刷新
	        beforeScroll: true,  //是否允许scroll组件派发一个开始滚动事件
	        hasMore: true,  //是否有更多的数据加载
	        result: []
	      }
	    },
	    watch:{
	    	query(){ //当检索词发生变化，调用服务端请求
	    		this.search()
	    	}
	    },
	    methods:{
	    	refresh() {
		        this.$refs.suggest.refresh()
		    },
	    	search() {
		          this.page = 1  //第一次请求，默认页数从第一页开始 （重置操作）
		          this.hasMore = true //有更多的数据
		          this.$refs.suggest.scrollTo(0, 0) //滚动到顶部
		          search(this.query, this.page, this.showSinger, perpage).then((res) => {
		          if (res.code === ERR_OK) {
		            this.result = this._genResult(res.data)
		         //   console.log(res.data )
		            this._checkMore(res.data) //检索有更多的数据
		          }
		        })
		    },
	    	_genResult(data) {
		        let ret = [] //定义返回结果
		        if (data.zhida && data.zhida.singerid) {  //同时存在两个字段
		        	//三点运算符：用于把一个数组转换为用逗号分隔的参数序列
		        	//常用在参数个数不定时的函数调用、数组合并等情形
		        	
		        	//data.zhida中的所有对象，拷贝到ret中
		        	//type为TYPE_SINGER中的所有对象拷贝到ret中
		          ret.push({...data.zhida, ...{type: TYPE_SINGER}})
		        }
		        if (data.song) { //存在该字段
		         	ret = ret.concat(this._normalizeSongs(data.song.list))
		        }
		        return ret //返回一个数组
		    },
		    _normalizeSongs(list) {
		        let ret = []
		        list.forEach((musicData) => {
		          if (musicData.songid && musicData.albummid) {
		            ret.push(createSong(musicData))
		          }
		        })
		        return ret
		    },
		    searchMore(){
		    	if(!this.hasMore){ //没有更多数据
		    		return
		    	}
		    	//如果有更多的数据，再次调用search请求接口，所得的数据与前面的数据进行拼接
		    	this.page++  //页数自动加1
		        search(this.query, this.page, this.showSinger, perpage).then((res) => {
		          if (res.code === ERR_OK) {
		            this.result = this.result.concat(this._genResult(res.data))
		            this._checkMore(res.data)
		          }
		        })
		    },
		    _checkMore(data){
		    	const song=data.song
		    	//如果歌曲列表中没有数据，或者，每页数目*页数>总数目
		    	if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
		          this.hasMore = false  //没有更多数据
		        }
		    },
		    getIconCls(item){
		    	if (item.type === TYPE_SINGER) {
		          return 'icon-mine'
		        } else {
		          return 'icon-music'
		        }
		    },
		    getDisplayName(item) {
		        if (item.type === TYPE_SINGER) {
		          return item.singername
		        } else {
		      
		      	return `${item.name}-${item.singer}`
		       	//	return `${item.songname}-${filterSinger(item.singer)}`
		        }
		    },
		    selectItem(item){
		    	if (item.type === TYPE_SINGER) { //如果是歌手类型
		          const singer = new Singer({  //实例化一个Singer对象
		            id: item.singermid,
		            name: item.singername
		          })
		          this.$router.push({  //设置路由，进行路由的跳转
		            path: `/search/${singer.id}`
		          })
		          this.setSinger(singer) //利用vuex将数据进行传递出去
		       } else { 
		       	//要改变playlist列表中的数据，将点击的歌曲插入playlist数组中
		          this.insertSong(item)
		        }
		        this.$emit('select', item) //向父组件派发一个事件通知
		    },
		    listScroll(){
		    	this.$emit('listScroll')
		    },
		    ...mapMutations({
		        setSinger: 'SET_SINGER'
		    }),
		    ...mapActions([
		        'insertSong'
		    ])
	    }
   	}
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
    .name{ text-align: left; text-indent: 20px;}
</style>