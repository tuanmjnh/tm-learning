<template>
  <div class="row">
    <div class="q-toolbar row no-wrap items-center">
      <div class="q-toolbar__title ellipsis">{{labelTitle}}</div>
      <q-btn :label="labelAccept" color="primary" no-caps dense class="q-btn--square q-mr-sm" @click="onFinish">
      </q-btn>
      <q-btn icon="view_module" flat rounded :color="viewType!=='list'?'teal':'blue-grey'" dense
        @click="onChangeView('box')">
        <q-tooltip>{{labelViewBox}}</q-tooltip>
      </q-btn>
      <q-btn icon="view_list" flat rounded :color="viewType==='list'?'teal':'blue-grey'" dense
        @click="onChangeView('list')">
        <q-tooltip>{{labelViewList}}</q-tooltip>
      </q-btn>
    </div>
    <div class="row col-12">
      <div class="col-md-3">
        <q-scroll-area style="height:200px">
          <div v-if="loadingDir" class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <tm-tree v-show="!loadingDir" :nodes="directories" :selected.sync="treeSelected" node-key="id"
            node-label="name" :draggable="true" @on-selected="getData" no-nodes-label="">
          </tm-tree>
        </q-scroll-area>
      </div>
      <div class="col" style="margin-left:5px">
        <q-scroll-area style="height:200px">
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
              <q-tooltip>{{e.name}}</q-tooltip>
              <!-- <span class="tooltip-text tooltip-bottom">{{e.name}}</span> -->
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
        </q-scroll-area>
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
  }
}
</script>

<style lang="scss" scoped>
.q-toolbar {
  padding-left: 0;
  padding-right: 0;
  min-height: initial;
}
.title {
}
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
</style>
