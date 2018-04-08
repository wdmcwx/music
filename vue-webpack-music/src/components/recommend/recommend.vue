<template>
	<div class="recommend-div" ref='recommend'>
		<Scroll class="recommend-content" :data='discList' ref='list'>
			<div>
				<div class="slider-wrapper" v-if="recommends.length">
					<Slider>
						<div v-for="item in recommends">
							<a :href="item.linkUrl">
								<img  :src="item.picUrl" @load="loadImage" class="needsclick"/>
							</a>
						</div>
					</Slider>
				</div>
				<div class="recommend-list">
					<h1 class="list-title">热门歌曲推荐</h1>
					<ul>
					<li v-for="item in discList" class="item" @click="selectItem(item)"> 
						<div class="icon">
							<img width="60" height="60"  v-lazy="item.imgurl"/>
						</div>
						<div class="text">
							<h2 class="name" v-html="item.creator.name"></h2>
							<p  class="desc" v-html="item.dissname"></p>
						</div>
					</li>
				</ul>
				</div>
		    </div>
		    <div class="loading-container" v-show="!discList.length">
		    	<Loading></Loading>
		    </div>
		</Scroll>
		<router-view></router-view>
	</div>
</template>

<script>
 import {getRecommend,getDiscList} from 'api/recommend.js'
 import {ERR_OK} from 'api/config'
 import Slider from '@/base/slider/slider'
 import Scroll from '@/base/scroll/scroll'
 import Loading from 'base/loading/loading'
 import {playlistMixin} from 'common/js/mixin'
 import {mapMutations} from 'vuex'
 
 export default{
 	mixins: [playlistMixin],
 	created(){	
 		this._getRecommend() 
 		this._getDiscList()
 	},
 	components:{
 		Slider ,  Scroll ,Loading
 	},
 	data(){
 		return{
 			recommends: [1,2,3],
        	discList: []
 		}
 	},
 	methods:{
 		selectItem(item){ //选择某一首歌曲
 			//设置路由
 			this.$router.push({ 
	          path: `/recommend/${item.dissid}`
	        })
 			//通过vuex将信息传递出去，即更改了state文件中的数据
 			this.setDisc(item)
 			//console.log(item)
 		},
 		handlePlaylist(playlist) { //实现mixins中的handlePlaylist方法
	        const bottom = playlist.length > 0 ? '60px' : ''
	        this.$refs.recommend.style.bottom = bottom 
	        this.$refs.list.refresh() // 让ListView 重新计算高度，进行渲染
	    },
 		_getRecommend() {
	        getRecommend().then((res) => {
	          if (res.code === ERR_OK) {
	            this.recommends = res.data.slider
	          }
	        })
      	},	
      	_getDiscList() {
	        getDiscList().then((res) => {
	          if (res.code === ERR_OK) {
	            this.discList = res.data.list
	          }
	        })
	    },
	    loadImage() {
	    	//避免所有的循环都进行一次loadImage（）调用
	        if (!this.checkloaded) {
	          this.checkloaded = true
	          this.$refs.scroll.refresh()
	        }
	    },
	    ...mapMutations({
           setDisc: 'SET_DISC'
        })
 	}
 }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend-div
    position: fixed
    width: 100%
    top: 158px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>