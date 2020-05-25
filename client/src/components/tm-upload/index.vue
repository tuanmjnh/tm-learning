<template>
  <div>
    <tm-file-list :data="data" :view-type.sync="viewType" :size="121" :labelTitle="labelTitle"
      :labelViewList="labelViewList" :labelViewBox="labelViewBox" :labelFileName="labelFileName"
      :labelFileSize="labelFileSize" :labelConfirmTitle="labelConfirmTitle" :labelConfirmContent="labelConfirmContent">
      <template v-slot:tool-bar>
        <q-btn round dense flat icon="cloud_upload" color="primary" @click="dialogUpload=!dialogUpload">
          <q-tooltip v-if="!$q.platform.is.mobile">{{$t('files.upload')}}</q-tooltip>
        </q-btn>
        <q-btn round dense flat icon="pageview" color="secondary" @click="dialogFiles=!dialogFiles">
          <q-tooltip v-if="!$q.platform.is.mobile">{{$t('files.open_file')}}</q-tooltip>
        </q-btn>
        <span class="q-pl-sm q-pr-sm">|</span>
        <q-btn dense flat icon="view_module" :color="viewType!=='list'?'indigo':'blue-grey'"
          @click="onChangeView('box')">
          <q-tooltip v-if="!$q.platform.is.mobile">{{$t('files.open_file')}}</q-tooltip>
        </q-btn>
        <q-btn dense flat icon="view_list" :color="viewType==='list'?'indigo':'blue-grey'"
          @click="onChangeView('list')">
          <q-tooltip v-if="!$q.platform.is.mobile">{{$t('files.open_file')}}</q-tooltip>
        </q-btn>
      </template>
    </tm-file-list>
    <!-- Dialog Files -->
    <q-dialog v-model="dialogFiles">
      <q-card style="width:672px;max-width:80vw;">
        <q-toolbar>
          <q-toolbar-title>{{$t('files.title')}}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip>{{$t('global.cancel')}}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-separator />
        <q-card-section class="q-pa-sm">
          <tm-files :selected.sync="selected" :accept="accept" :multiple="multiple" :view-type.sync="viewTypeFiles"
            :url="uploadUrl" :headers="headers" :labelViewList="labelViewList" :labelAccept="labelAccept"
            :labelViewBox="labelViewBox" :labelFileName="labelFileName" :labelFileSize="labelFileSize"
            @on-finish="onFinishBrowse">
          </tm-files>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Dialog Upload-->
    <q-dialog v-model="dialogUpload">
      <q-card style="width:500px;max-width:80vw;">
        <q-toolbar>
          <q-toolbar-title>{{$t('files.upload')}}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip>{{$t('global.cancel')}}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-separator />
        <q-card-section>
          <q-uploader ref="upload" square flat :multiple="multiple" :max-file-size="maxFileSize" :accept="accept"
            style="width:100%" :url="uploadUrl" :headers="headers" @uploaded="onFinishUpload"
            @finish="dialogUpload=false">
          </q-uploader>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import tmFileList from '@/components/tm-file-list'
import tmFiles from '@/components/tm-files'
export default {
  components: { tmFileList, tmFiles },
  props: {
    data: { default: null },
    multiple: { type: Boolean, default: false },
    maxFileSize: { type: Number, default: 1024 * 1024 * 2 }, // 2MB
    uploadUrl: { type: String, required: true },
    headers: { type: Array, default: () => [] },
    accept: { type: String, default: undefined },
    loading: { type: Boolean, default: false },
    isHeader: { type: Boolean, default: false },
    isCount: { type: Boolean, default: false },
    isBorder: { type: Boolean, default: false },
    size: { type: Number, default: 80 },
    viewType: { type: String, default: 'box' },
    labelTitle: { type: String, default: '' },
    labelAccept: { type: String, default: 'Accept' },
    labelViewList: { type: String, default: 'View list' },
    labelViewBox: { type: String, default: 'View box' },
    labelFileName: { type: String, default: 'File name' },
    labelFileSize: { type: String, default: 'Size' },
    labelConfirmTitle: { type: String, default: 'Warning' },
    labelConfirmContent: { type: String, default: 'Are you sure you want to delete this record?' }
  },
  data() {
    return {
      dialogFiles: false,
      dialogUpload: false,
      viewTypeFiles: 'box',
      selected: []
    }
  },
  computed: {
    slotToolBar() {
      return !!this.$slots['tool-bar']
    },
    slotPanelLeft() {
      return !!this.$slots['panel-left']
    }
  },
  methods: {
    onChangeView(val) {
      this.$emit('update:viewType', val)
      this.$emit('on-change-view', val)
    },
    onFinishBrowse(selected) {
      this.dialogFiles = false
      if (selected) {
        const _data = this.multiple ? [...this.data, ...selected.map(x => x.fullName)] : selected.fullName
        this.$emit('update:data', _data)
      }
      this.$emit('finish-browse', selected)
    },
    onFinishUpload(info) {
      var res = JSON.parse(info.xhr.response)
      if (res.length > 0) {
        if (this.multiple) this.data.push(res[0].fullName)
        else this.$emit('update:data', res[0].fullName)
      }
      this.$emit('finish-uploaded', res)
    },
    onDeleteImage(file) {
      const index = this.data.indexOf(file)
      if (index > -1) this.data.splice(index, 1)
    }
  }
}
</script>

<style>
</style>
