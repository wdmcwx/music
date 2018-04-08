<template>
	<div class="song_list">
		<ul>
			<li v-for="(song,index) in songs" class="item" @click="selectItem(song,index)">
				<div class="rank" v-show="rank">
					<span :class="getRankCls(index)" v-text="getRankText(index)"></span>
				</div>
				<div class="content">
					<h2 class="name">{{song.name}}</h2>
					<p class="desc">{{getDesc(song)}}</p>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	export default{
		props: {
	      songs: {
	        type: Array,
	        default: []
	      },
	      rank: {
	        type: Boolean,
	        default: false  //是否进行显示排行图标
	      }
	    },
		methods:{
			getDesc(song) {
				return `${song.singer}·${song.album}`
			},
			selectItem(item ,index){
				//派发事件，发送出点击的歌曲和索引
				this.$emit('select',item,index)
			},
			getRankCls(index) {
		        if (index <= 2) {
		          return `icon icon${index}`
		        } else {
		          return 'text'
		        }
		    },
		    getRankText(index) {
		        if (index > 2) {
		          return index + 1
		        }
		    }
		}
	}
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  .song_list
    .item
      display: flex
      align-items: center
      box-sizing: border-box
      height: 64px
      font-size: $font-size-medium
      color:#ffffff
    
      .rank
        flex: 0 0 25px
        width: 25px
        margin-right: 30px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-theme
          font-size: $font-size-large
      .content
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          no-wrap()
          color: $color-text
        .desc
          no-wrap()
          margin-top: 4px
          color: $color-text-d
   .item{ text-align: left; opacity: 0.8;}  
   .item p{ font-size: 14px; opacity: 0.5;}
   .icon0{ background-image: url(first@3x.png);}
   .icon1{background-image: url(second@3x.png);}
   .icon2{background-image: url(third@3x.png);}
</style>