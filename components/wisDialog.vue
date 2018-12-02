<template>
  <div class="comContainer_wisDialog">
    <el-dialog :visible.sync="wisDialogVisible" :show-close="false" :width="width" :top="top"
      custom-class="wisDialog">
      <div class="dialogTitleC" slot="title">
        <span class="title">{{title}}</span>
        <span @click="wisDialogVisible = false" class="dialogTitleClose"><i class="el-icon-close"></i></span>
      </div>
      <slot></slot>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String
    },
    visible: {
      type: Boolean,
      required: true
    },
    width: {
      type: String,
      default: '600px'
    },
    top: {
      type: String,
      default: '15vh'
    }
  },
  created () {
    this.wisDialogVisible = this.visible
  },
  mounted () {},
  data () {
    return {
      wisDialogVisible: false
    }
  },
  computed: {},
  watch: {
    visible (v) {
      this.wisDialogVisible = v
    },
    wisDialogVisible (v) {
      this.$emit('update:visible', v)
    }
  },
  filters: {},
  methods: {}
}
</script>

<style scoped lang="scss">
  .comContainer_wisDialog {
    & .dialogTitleC {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      & .dialogTitleClose {
        display: inline-block;
        width: 20px;
        height: 20px;
        text-align: center;
        line-height: 20px;
        cursor: pointer;
        &:hover {
          color: #ddd;
        }
      }
    }
  }
</style>
<style lang="scss">
  .comContainer_wisDialog {
    & .wisDialog {
      overflow: hidden;
      & > .el-dialog__header {
        background-color: #28ABFB !important;
        padding: 13px 20px !important;
      }
      & > .el-dialog__body {
        padding: 20px !important;
        max-height: 70vh;
        overflow: auto;
      }
    }
  }
</style>
