<template>
  <div class="tm-files">
    <div class="tool-bar">
      <div class="title">{{labelTitle}}</div>
      <div class="menu">
        <div class="btn btn-accept tooltip" @click="onFinish">
          <i class="icon-btn material-icons">check</i>
          <span class="tooltip-text tooltip-tool-bar">{{labelAccept}}</span>
        </div>
        <div :class="['btn btn-view tooltip',viewType!=='list'?'active':'']" @click="onChangeView('box')">
          <i class="icon-btn material-icons">view_module</i>
          <span class="tooltip-text tooltip-tool-bar">{{labelViewBox}}</span>
        </div>
        <div :class="['btn btn-group btn-view tooltip',viewType==='list'?'active':'']" @click="onChangeView('list')">
          <i class="icon-btn material-icons">view_list</i>
          <span class="tooltip-text tooltip-tool-bar">{{labelViewList}}</span>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-left">
        <div v-if="loadingDir" class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <tm-tree v-show="!loadingDir" :nodes="directories" :selected.sync="treeSelected" node-key="id" node-label="name"
          :draggable="true" @on-selected="getData" no-nodes-label="">
        </tm-tree>
      </div>
      <div class="panel-right">
        <div v-if="loadingFile" class="lds-roller">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="view-box" v-if="viewType!=='list'">
          <div v-show="!loadingFile" v-for="(e,i) in files" :key="i" :class="['item tooltip',onGetSelected(e)]"
            @click="onSelectItem(e)" @contextmenu.prevent="$refs.contextMenu.openMenu(e,$event)"
            :style="`width:${size}px;height:${size}px`">
            <div class="content" v-if="extension.isImage(e.name)"
              :style="extension.getBackgroundImage(e.fullName)+`;height:${size-4}px`" />
            <!-- <img class="content" :src="e.fullName"> -->
            <!-- {{e.fullName}} -->
            <i v-else-if="extension.isAudio(e.name)" class="content material-icons"
              :style="`height:${size-4}px`">audiotrack</i>
            <!-- <audio controls>
            <source :src="e.fullName" type="audio/ogg">
            <source :src="e.fullName" type="audio/mpeg">
          </audio> -->
            <i v-else-if="extension.isVideo(e.name)" class="content material-icons"
              :style="`height:${size-4}px`">video_library</i>
            <!-- <video controls>
            <source :src="e.fullName" type="video/mp4">
            <source :src="e.fullName" type="video/ogg">
          </video> -->
            <i v-else-if="extension.isPdf(e.name)" class="content material-icons"
              :style="`height:${size-4}px`">picture_as_pdf</i>
            <i v-else-if="extension.isFlash(e.name)" class="content material-icons"
              :style="`height:${size-4}px`">burst_mode</i>
            <i v-else-if="extension.isCode(e.name)" class="content material-icons"
              :style="`height:${size-4}px`">code</i>
            <i v-else-if="extension.isDoc(e.namee)" class="content material-icons"
              :style="`height:${size-4}px`">description</i>
            <i v-else-if="extension.isSheet(e.name)" class="content material-icons"
              :style="`height:${size-4}px`">list_alt</i>
            <i v-else-if="extension.isText(e.name)" class="content material-icons"
              :style="`height:${size-4}px`">assignment</i>
            <i v-else class="content material-icons" :key="i" :style="`height:${size-4}px`">file_copy</i>
            <span class="tooltip-text tooltip-bottom">{{e.name}}</span>
          </div>
        </div>
        <div v-else class="view-list">
          <table :class="[isBorder?'table-border':'']">
            <thead v-if="isHeader">
              <tr>
                <th v-if="isCount" class="count">#</th>
                <th>{{labelFileName}}</th>
                <!-- <th>Type</th> -->
                <th>{{labelFileSize}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(e,i) in files" :key="i" :class="['item',onGetSelected(e)]" @click="onSelectItem(e)">
                <td v-if="isCount" class="count">{{i+1}}</td>
                <td>{{e.name}}</td>
                <!-- <td>{{e.ext}}</td> -->
                <td>{{e.size}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- <tm-file-list :files="files" :loading="loadingFile"></tm-file-list> -->
    </div>
    <context-menu ref="contextMenu" :data.sync="contextData" :top="-88">
      <template slot="content">
        <li @click="onActionContext('delete')"><i class="material-icons">clear</i> {{$t('global.delete')}}</li>
      </template>
    </context-menu>
  </div>
</template>

<script>
import axios from 'axios'
import tmTree from '@/components/tm-tree'
// import tmFileList from '@/components/tm-file-list'
import contextMenu from '@/components/context-menu'
import * as extension from '@/utils/extension'
export default {
  name: 'tm-files',
  components: { tmTree, contextMenu },
  props: {
    selected: { default: undefined },
    url: { type: String, default: '' },
    // urlFile: { type: String, default: '' },
    // urlDirectory: { type: String, default: '' },
    headers: { type: Array, default: () => { } },
    noNodesLabel: { type: String, default: 'No data available' },
    accept: { type: String, default: undefined },
    multiple: { type: Boolean, default: false },
    isHeader: { type: Boolean, default: true },
    isCount: { type: Boolean, default: true },
    isBorder: { type: Boolean, default: true },
    size: { type: Number, default: 78 },
    viewType: { type: String, default: 'box' },
    labelTitle: { type: String, default: '' },
    labelViewList: { type: String, default: 'View list' },
    labelViewBox: { type: String, default: 'View box' },
    labelAccept: { type: String, default: 'Accept' },
    labelFileName: { type: String, default: 'File name' },
    labelFileSize: { type: String, default: 'Size' }
  },
  data() {
    return {
      loadingDir: true,
      loadingFile: true,
      directories: [],
      files: [],
      treeSelected: null,
      loadedFolder: '',
      contextMenu: false,
      contextData: null,
      extension: extension
    }
  },
  created() {
    this.getDirectories().then(x => {
      this.getFiles()
    })
  },
  // computed: {
  // },
  // watch: {
  //   selected(val) {
  //     console.log(val)
  //   }
  // },
  methods: {
    getDirectories() {
      return new Promise((resolve, reject) => {
        let headers = {}
        this.headers.forEach(e => {
          headers[e.name] = e.value
        })
        axios.get(`${this.url}/directories`, { headers: headers }).then(res => {
          if (res.data) this.directories = res.data
          this.loadingDir = false
          resolve(res.data)
        }).catch((e) => {
          reject(e)
        })
      })
    },
    getFiles(dir = '', loadedFolder) {
      // this.$emit('update:selected', [])
      this.files = []
      this.loadingFile = true
      this.loadedFolder = loadedFolder
      let headers = {}
      this.headers.forEach(e => {
        headers[e.name] = e.value
      })
      axios.get(`${this.url}/files`, { headers: headers, params: { dir: dir } }).then(async res => {
        if (res.data) {
          if (this.accept === undefined || this.accept === '*') {
            this.files = res.data
          } else {
            const _accept = this.accept.split(',')
            if (_accept.includes('*')) {
              this.files = res.data
            } else {
              for await (let e of res.data) {
                if (_accept.includes('image/*')) {
                  if (this.isImage(e.name)) {
                    this.files.push(e)
                    continue
                  }
                }
                if (_accept.includes('audio/*')) {
                  if (this.isAudio(e.name)) {
                    this.files.push(e)
                    continue
                  }
                }
                if (_accept.includes('video/*')) {
                  if (this.isVideo(e.name)) {
                    this.files.push(e)
                    continue
                  }
                }
                if (_accept.includes('code/*')) {
                  if (this.isCode(e.name)) {
                    this.files.push(e)
                    continue
                  }
                }
                if (_accept.includes(this.extension.getExtension(e.name))) {
                  this.files.push(e)
                  continue
                }
              }
            }
          }
        }
      }).finally(() => {
        setTimeout(() => { this.loadingFile = false }, 300)
      })
    },
    getData(node) {
      if (!this.treeSelected) this.treeSelected = node
      if (this.treeSelected.name !== this.loadedFolder) this.getFiles(node.fullName, node.name)
      // this.getFiles(node.fullName.replace(/^uploads\\/, ''))
    },
    onSelectItem(item) {
      // item.selected = true
      if (this.multiple) {
        const index = this.selected.findIndex(x => x.name === item.name)
        if (index > -1) {
          this.selected.splice(index, 1)
          this.$emit('on-unselect', item)
        } else {
          this.selected.push(item)
          this.$emit('on-select', item)
        }
      } else {
        this.$emit('update:selected', item)
        this.$emit('on-select', item)
      }
    },
    onChangeView(view) {
      this.$emit('update:viewType', view)
    },
    onGetSelected(item) {
      if (this.multiple) {
        const index = this.selected.findIndex(x => x.name === item.name)
        return index > -1 ? 'selected' : ''
      } else {
        return this.selected.name === item.name ? 'selected' : ''
      }
    },
    onActionContext(type) {
      if (type === 'delete') {
        // console.log(this.contextData)
      }
    },
    onFinish() {
      // this.$emit('update:selected', [])
      if (this.multiple) this.$emit('on-finish', [...this.selected])
      else this.$emit('on-finish', this.selected)
    }
    // isImage(value) {
    //   if (!value) return false
    //   const rs = /\.(gif|jpg|jpeg|tiff|png|img|ico)$/i.test(value.toLowerCase())
    //   // console.log(this.accept, this.accept === undefined)
    //   return rs
    //   // if (this.accept === undefined || this.accept.includes('*') || this.accept.includes('image/*')) return rs
    //   // else return rs && this.accept.includes(this.getExtension(value))
    // },
    // isAudio(value) {
    //   if (!value) return false
    //   const rs = /\.(mp3|wav|wave|ogg|m4a|3ga|4mp|aa3)$/i.test(value.toLowerCase())
    //   return rs
    //   // if (this.accept === undefined || this.accept.includes('*') || this.accept.includes('audio/*')) return rs
    //   // else return rs && this.accept.includes(this.getExtension(value))
    // },
    // isVideo(value) {
    //   if (!value) return false
    //   const rs = /\.(3g2|3gp|3gp2|3gpp|3gpp2|amv|flv|gom|mp4|mov|mpe|mpeg|mpg||kmv|mkv|wvm|wmv)$/i.test(value.toLowerCase())
    //   return rs
    //   // if (this.accept === undefined || this.accept.includes('*') || this.accept.includes('video/*')) return rs
    //   // else return rs && this.accept.includes(this.getExtension(value))
    // },
    // isPdf(value) {
    //   if (!value) return false
    //   const rs = /\.(pdf)$/i.test(value.toLowerCase())
    //   return rs
    //   // if (this.accept === undefined || this.accept.includes('*')) return rs
    //   // else return rs && this.accept.includes(this.getExtension(value))
    // },
    // isDoc(value) {
    //   if (!value) return false
    //   const rs = /\.(doc|docx)$/i.test(value.toLowerCase())
    //   return rs
    //   // if (this.accept === undefined || this.accept.includes('*')) return rs
    //   // else return rs && this.accept.includes(this.getExtension(value))
    // },
    // isSheet(value) {
    //   if (!value) return false
    //   const rs = /\.(xls|xlsx)$/i.test(value.toLowerCase())
    //   return rs
    //   // if (this.accept === undefined || this.accept.includes('*')) return rs
    //   // else return rs && this.accept.includes(this.getExtension(value))
    // },
    // isFlash(value) {
    //   if (!value) return false
    //   const rs = /\.(swf)$/i.test(value.toLowerCase())
    //   return rs
    //   // if (this.accept === undefined || this.accept.includes('*')) return rs
    //   // else return rs && this.accept.includes(this.getExtension(value))
    // },
    // isCode(value) {
    //   if (!value) return false
    //   const rs = /\.(sql|json|js)$/i.test(value.toLowerCase())
    //   return rs
    //   // if (this.accept === undefined || this.accept.includes('*') || this.accept.includes('code/*')) return rs
    //   // else return rs && this.accept.includes(this.getExtension(value))
    // },
    // isText(value) {
    //   if (!value) return false
    //   const rs = /\.(txt|rtf)$/i.test(value.toLowerCase())
    //   return rs
    //   // if (this.accept === undefined || this.accept.includes('*') || this.accept.includes('text/*')) return rs
    //   // else return rs && this.accept.includes(this.getExtension(value))
    // }
  }
}
</script>

<style lang="scss">
$tooltip-color: #757575;
.tm-files {
  // min-height: 200px;
  min-width: 510px;
  .tool-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    // flex-wrap: wrap;
    .menu {
      .btn-group {
        margin-left: 0px !important;
      }
      .btn {
        display: inline-block;
        margin-left: 5px;
      }
      i.icon-btn {
        padding: 6px 12px;
        cursor: pointer;
        color: #fff;
      }
      .btn-view {
        background-color: #009688;
        &:hover,
        &.active {
          background-color: #02776b;
        }
      }
      .btn-accept {
        background-color: #2196f3;
        &:hover {
          background-color: #2c8bd8;
        }
      }
    }
  }
  .panel {
    display: flex;
    // flex-wrap: wrap;
    // overflow: scroll;
    min-height: 200px;
    .panel-left {
      // min-width: 200px;
      border-right: 1px solid #ccc;
      white-space: nowrap;
      padding-right: 15px;
      // margin-right: 10px;
      position: relative;
      min-width: 180px;
      // width: 160px;
      // float: left;
      overflow: auto;
      // overflow-x: hidden;
    }
    .panel-right {
      // width: 350px;
      // overflow: auto;
      position: relative;
      // float: left;
      width: 100%;
      .item {
        cursor: pointer;
      }
      .view-box {
        .item {
          // width: 78px;
          // height: 78px;
          border: 1px solid #ccc;
          // overflow: hidden;
          padding: 1px;
          margin: 0 0 6px 6px;
          vertical-align: middle;
          text-align: center;
          position: relative;
          display: inline-block;
          transition: all 0.3s;
          .content {
            // height: 74px;
            // max-width: 50px;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
          }
          i.content {
            font-size: 28px;
          }
          &.selected {
            border-color: #2196f3;
          }
          &:hover {
            border-color: #02776b;
          }
          // &:nth(4) {
          //   margin-left: 0;
          // }
        }
      }
      .view-list {
        table {
          width: 100%;
          max-width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          thead tr,
          thead th {
            height: 28px;
            border-color: rgba(0, 0, 0, 0.12);
          }
          tbody tr,
          tbody td {
            border-color: #fff;
          }
          &.table-border tbody tr,
          &.table-border tbody td {
            border-color: rgba(0, 0, 0, 0.12);
          }
          td,
          th,
          thead {
            border-style: solid;
            border-width: 0;
          }
          th.sortable {
            cursor: pointer;
          }
          th {
            white-space: nowrap;
          }
          td,
          th,
          thead {
            border-style: solid;
            border-width: 0;
          }
          td,
          th {
            padding: 3px 6px;
            background-color: inherit;
          }
          th {
            font-weight: 500;
            font-size: 12px;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            text-align: left;
          }
          tbody tr:not(:last-child) td,
          thead th,
          tbody tr:not(:last-child) td,
          thead th {
            border-bottom-width: 1px;
          }
          tbody tr {
            // font-family: Roboto, -apple-system, Helvetica Neue, Helvetica, Arial,
            //   sans-serif;
            color: #393939;
            &:hover {
              color: #02776b;
            }
            &.selected {
              color: #2196f3;
            }
          }
          tbody tr td.count,
          tbody tr th.count {
            text-align: center;
          }
        }
      }
    }
  }
  /* Tooltip text */
  .tooltip {
    position: relative;
  }
  .tooltip .tooltip-text {
    visibility: hidden;
    width: 120px;
    word-break: break-word;
    background-color: $tooltip-color;
    color: #fff;
    text-align: center;
    padding: 5px;
    border-radius: 3px;

    /* Position the tooltip text */
    position: absolute;
    z-index: 1;
    bottom: 108%;
    left: 50%;
    margin-left: -60px;

    /* Fade in tooltip */
    opacity: 0;
    transition: opacity 0.3s;
    // display: none;
  }

  /* Tooltip arrow */
  .tooltip .tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: $tooltip-color transparent transparent transparent;
  }

  /* Show the tooltip text when you mouse over the tooltip container */
  .tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
    display: initial;
  }
  .tooltip-top {
    bottom: 108% !important;
    left: 50% !important;
    right: initial !important;
    top: initial !important;
    margin-left: -60px !important;
  }
  .tooltip-top::after {
    top: 100% !important;
    left: 50% !important;
    right: initial !important;
    bottom: initial !important;
    border-color: $tooltip-color transparent transparent transparent !important;
  }
  .tooltip-right {
    top: -5px !important;
    left: 108% !important;
    right: initial !important;
    bottom: initial !important;
  }
  .tooltip-right::after {
    top: 50% !important;
    right: 100% !important;
    left: initial !important;
    bottom: initial !important;
    border-color: transparent $tooltip-color transparent transparent !important;
  }
  .tooltip-bottom {
    top: 108% !important;
    left: 50% !important;
    right: initial !important;
    bottom: initial !important;
    margin-left: -60px !important;
  }
  .tooltip-bottom::after {
    bottom: 100% !important;
    left: 50% !important;
    right: initial !important;
    top: initial !important;
    border-color: transparent transparent $tooltip-color transparent !important;
  }
  .tooltip-left {
    top: 28% !important;
    bottom: auto !important;
    right: 107% !important;
    left: initial !important;
  }
  .tooltip-left::after {
    top: 38% !important;
    left: 104% !important;
    right: initial !important;
    bottom: initial !important;
    border-color: transparent transparent transparent $tooltip-color !important;
  }
  .tooltip-tool-bar {
    top: 121% !important;
    left: -216% !important;
    right: initial !important;
    bottom: initial !important;
    margin-left: 0 !important;
    // width: fit-content !important;
  }
  .tooltip-tool-bar::after {
    bottom: 100% !important;
    left: initial !important;
    right: 12% !important;
    top: initial !important;
    border-color: transparent transparent $tooltip-color transparent !important;
  }

  /* Loading folder*/
  .lds-ring {
    display: inline-block;
    position: absolute;
    width: 30px;
    height: 30px;
    top: 38%;
    left: 26%;
  }
  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 30px;
    height: 30px;
    margin: 3px;
    border: 3px solid #009688;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #009688 transparent transparent transparent;
  }
  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Loading files*/
  .lds-roller {
    display: inline-block;
    position: absolute;
    width: 80px;
    height: 80px;
    top: 30%;
    left: 38%;
  }
  .lds-roller div {
    animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    transform-origin: 40px 40px;
  }
  .lds-roller div:after {
    content: " ";
    display: block;
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #009688;
    margin: -4px 0 0 -4px;
  }
  .lds-roller div:nth-child(1) {
    animation-delay: -0.036s;
  }
  .lds-roller div:nth-child(1):after {
    top: 63px;
    left: 63px;
  }
  .lds-roller div:nth-child(2) {
    animation-delay: -0.072s;
  }
  .lds-roller div:nth-child(2):after {
    top: 68px;
    left: 56px;
  }
  .lds-roller div:nth-child(3) {
    animation-delay: -0.108s;
  }
  .lds-roller div:nth-child(3):after {
    top: 71px;
    left: 48px;
  }
  .lds-roller div:nth-child(4) {
    animation-delay: -0.144s;
  }
  .lds-roller div:nth-child(4):after {
    top: 72px;
    left: 40px;
  }
  .lds-roller div:nth-child(5) {
    animation-delay: -0.18s;
  }
  .lds-roller div:nth-child(5):after {
    top: 71px;
    left: 32px;
  }
  .lds-roller div:nth-child(6) {
    animation-delay: -0.216s;
  }
  .lds-roller div:nth-child(6):after {
    top: 68px;
    left: 24px;
  }
  .lds-roller div:nth-child(7) {
    animation-delay: -0.252s;
  }
  .lds-roller div:nth-child(7):after {
    top: 63px;
    left: 17px;
  }
  .lds-roller div:nth-child(8) {
    animation-delay: -0.288s;
  }
  .lds-roller div:nth-child(8):after {
    top: 56px;
    left: 12px;
  }
  @keyframes lds-roller {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
