<template>
  <div class="comContainer_wisEditor">
    <div ref="editor"></div>
  </div>
</template>

<script>
import E from '../static/wangEditor/release/wangEditor.min.js'

export default {
  props: {
    uploadPath: {
      type: String,
      default: window.HOST + '/api/file/richText/multi/img/upload?appCode=' + window.appCode
    }
  },
  created () {},
  mounted () {
    this.editorInstance = new E(this.$refs.editor)
    this.editorInstance.customConfig.menus = ['fontName', 'fontSize', 'bold', 'italic', 'underline', 'strikeThrough',
      'foreColor', 'backColor', 'link', 'list', 'justify', 'image', 'table', 'undo', 'redo', 'fullscreen']
    // 配置服务器端地址
    this.editorInstance.customConfig.uploadImgServer = this.uploadPath
    this.editorInstance.customConfig.uploadImgMaxLength = 5
    this.editorInstance.customConfig.uploadFileName = 'file'
    this.editorInstance.customConfig.uploadImgTimeout = 30 * 1000
    this.editorInstance.customConfig.zIndex = 10
    this.editorInstance.customConfig.customAlert = info => {
      this.$wisToast(info, 'error')
    }
    // 自定义字体 '宋体', '新宋体', '仿宋', '楷体', '黑体', '微软雅黑'
    this.editorInstance.customConfig.fontNames = [
      { name: '宋体', value: 'SimSun' },
      { name: '新宋体', value: 'NSimSun' },
      { name: '仿宋', value: 'FangSong' },
      { name: '楷体', value: 'KaiTi' },
      { name: '黑体', value: 'SimHei' },
      { name: '微软雅黑', value: 'Microsoft YaHei' }
    ]
    this.editorInstance.customConfig.uploadImgHooks = {
      before: (xhr, editor, files) => {
        // 图片上传之前触发
        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，files 是选择的图片文件
        // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
        // return {
        //     prevent: true,
        //     msg: '放弃上传'
        // }
      },
      success: (xhr, editor, result) => {
        // 图片上传并返回结果，图片插入成功之后触发
        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
      },
      fail: (xhr, editor, result) => {
        // 图片上传并返回结果，但图片插入错误时触发
        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
      },
      error: (xhr, editor) => {
        // 图片上传出错时触发
        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
      },
      timeout: (xhr, editor) => {
        // 图片上传超时时触发
        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
      },
      // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
      // （但是，服务器端返回的必须是一个 JSON 格式字符串！！！否则会报错）
      customInsert: (insertImg, result, editor) => {
        // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
        // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
        // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
        if (result.status === 0) {
          if (result.data && result.data.length > 0) {
            result.data.forEach(url => {
              insertImg(url)
            })
          }
        } else {
          this.$wisToast(result.message || '上传失败', 'error')
        }
      }
    }
    this.editorInstance.create()
    this.$emit('update:editorInstance', this.editorInstance)
  },
  data () {
    return {
      editorInstance: null
    }
  },
  computed: {},
  watch: {},
  filters: {},
  methods: {
    getHtml () {
      return this.editorInstance ? this.editorInstance.txt.html() : ''
    },
    setHtml (data) {
      if (this.editorInstance) {
        this.editorInstance.txt.html(data)
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .comContainer_wisEditor {
    position: relative;
    min-width: 600px;
  }
</style>
