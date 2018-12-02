<template>
  <cell primary="content" class="comContainer_wisCell" :class="{editable: editable}" :value-align="valueAlign" :align-items="alignItems"
    :isLink="isLink" :link="link" :borderIntent="borderIntent" :arrowDirection="arrowDirection">
    <span slot="title" class="cellTitle">{{title}}</span>
    <div class="cellContent">
      <slot></slot>
    </div>
  </cell>
</template>

<script>
import { Cell } from 'k12vux'

export default {
  props: {
    title: {
      type: String,
      required: true
    },
    isLink: Boolean,
    link: [String, Object],
    valueAlign: {
      type: String,
      default: 'left'
    },
    alignItems: {
      type: String,
      default: 'flex-start'
    },
    borderIntent: {
      type: Boolean,
      default: true
    },
    arrowDirection: String,
    editable: Boolean
  },
  components: {
    Cell
  },
  data () {
    return {}
  }
}
</script>
<style lang="scss" scoped>
  .comContainer_wisCell {
    &.editable {
      .cellTitle {
        color: #000;
      }
      .cellContent {
        color: #999;
      }
    }
    .cellTitle {
      display: inline-block;
      color: #999;
      word-break: break-all;
      height: 30px;
      &:after {
        content: ".";
        display: none;
        // display: inline-block;
        width: 100%;
        overflow: hidden;
        height: 0;
      }
    }
    .cellContent {
      word-break: break-all;
      color: #333;
    }
  }
</style>
