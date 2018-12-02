<template>
  <div class="comContainer_wisWarning">
    <img :src="img" alt="">
    <div class="tipC">
      <template v-if="['adaptMobile', 'adaptPC'].indexOf(type) > -1">
        <div class="firstLine">{{`该功能仅在${type === 'adaptMobile' ? '手机' : 'PC'}端查看`}}</div>
        <div class="lastLine">{{`${type === 'adaptMobile' ? '电脑版' : '手机端'}暂不支持显示`}}</div>
      </template>
      <template v-else>
        <div class="text">{{text}}</div>
      </template>
    </div>
  </div>
</template>

<script>
import adaptMobile from '../static/images/adaptMobile.png'
import adaptPC from '../static/images/adaptPC.png'
import empty from '../static/images/empty.png'
import warning from '../static/images/warning.png'

export default {
  props: {
    type: {
      type: String,
      required: true,
      validator: v => {
        return ['adaptMobile', 'adaptPC', 'empty', 'warning'].indexOf(v) !== -1
      }
    },
    title: String
  },
  created () {},
  mounted () {},
  data () {
    return {}
  },
  computed: {
    img () {
      switch (this.type) {
        case 'adaptMobile':
          return adaptMobile
        case 'adaptPC':
          return adaptPC
        case 'empty':
          return empty
        case 'warning':
          return warning
      }
    },
    text () {
      if (this.title) {
        return this.title
      } else if (this.type === 'empty') {
        return '暂无数据'
      } else if (this.type === 'warning') {
        return '该内容已被删除'
      }
      return ''
    }
  },
  watch: {},
  filters: {},
  methods: {}
}
</script>

<style scoped lang="scss">
  .comContainer_wisWarning {
    display: flex;
    flex-direction: column;
    align-items: center;
    & .tipC {
      display: flex;
      flex-direction: column;
      align-items: center;
      & .firstLine {
        margin-top: 10px;
        font-size: 14px;
        color: #333;
      }
      & .lastLine {
        font-size: 12px;
        color: #999;
      }
      & .text {
        margin-top: 18px;
        font-size: 14px;
        color: #666;
      }
    }
  }
</style>
