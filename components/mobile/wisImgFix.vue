<template>
  <div :class="`comContainer_wisImgFix ${centerType}`">
    <img v-if="show" :src="src" :style="imgStyle" alt="">
  </div>
</template>

<script>
const getImgSize = (data) => {
  return new Promise((resolve, reject) => {
    // console.log(data)
    let img = new Image()
    img.src = data
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.onerror = e => {
      reject(e)
    }
  })
}

export default {
  props: ['src'],
  created () {
    this.srcData = this.src
  },
  mounted () {},
  data () {
    return {
      show: false,
      srcData: '',
      imgStyle: {},
      centerType: ''
    }
  },
  computed: {},
  watch: {
    src (v) {
      this.srcData = this.src
    },
    async srcData (v) {
      if (v) {
        let {width, height} = await getImgSize(v)
        if (width === height) {
          this.imgStyle = {width: '100%', height: '100%'}
        } else if (width > height) {
          this.imgStyle = {height: '100%'}
          this.centerType = 'horizontalCenter'
        } else {
          this.imgStyle = {width: '100%'}
          this.centerType = 'verticalCenter'
        }
        this.show = true
      }
    }
  },
  filters: {},
  methods: {}
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
