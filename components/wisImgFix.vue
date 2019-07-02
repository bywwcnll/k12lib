<template>
  <div ref="container" :class="`comContainer_wisImgFix ${centerType}`">
    <img v-if="show" :src="src" :style="imgStyle" alt="">
  </div>
</template>

<script>
const getImgSize = (data) => {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.onerror = e => {
      reject(e)
    }
    img.src = data
  })
}

export default {
  props: {
    src: String,
    /* 宽高比 w/h */
    ratio: {
      type: Number,
      default: 1
    },
    auto: Boolean,
    whiteSpace: Boolean
  },
  created () {},
  mounted () {
    this.computedRatio = this.ratio
    if (this.auto) {
      window.addEventListener('resize', this.onResize)
      this.onResize()
    } else {
      this.refresh()
    }
  },
  destroyed () {
    if (this.auto) {
      window.removeEventListener('resize', this.onResize)
    }
  },
  data () {
    return {
      show: false,
      computedRatio: 1,
      imgStyle: {},
      centerType: ''
    }
  },
  computed: {},
  watch: {
    async src () {
      this.refresh()
    },
    ratio () {
      this.computedRatio = this.ratio
      this.refresh()
    }
  },
  filters: {},
  methods: {
    async refresh () {
      if (this.src) {
        let {width, height} = await getImgSize(this.src)
        let currentRatio = width / height
        if (currentRatio === this.computedRatio) {
          this.imgStyle = {width: '100%', height: '100%'}
        } else if (currentRatio > this.computedRatio) {
          if (!this.whiteSpace) {
            this.imgStyle = {height: '100%'}
            this.centerType = 'horizontalCenter'
          } else {
            this.imgStyle = {width: '100%'}
            this.centerType = 'verticalCenter'
          }
        } else {
          if (!this.whiteSpace) {
            this.imgStyle = {width: '100%'}
            this.centerType = 'verticalCenter'
          } else {
            this.imgStyle = {height: '100%'}
            this.centerType = 'horizontalCenter'
          }
        }
        this.show = true
      }
    },
    onResize () {
      let parentElement = this.$refs.container.parentElement
      // console.log(parentElement)
      if (!parentElement) return
      let { offsetWidth, offsetHeight } = parentElement
      this.computedRatio = offsetWidth / offsetHeight
      this.refresh()
    }
  }
}
</script>

<style scoped lang="scss">
  .comContainer_wisImgFix {
    display: inline-block;
    overflow: hidden;
    &.horizontalCenter {
      display: flex;
      justify-content: center;
    }
    &.verticalCenter {
      display: flex;
      align-items: center;
    }
    > img {
      display: block;
    }
  }
</style>
