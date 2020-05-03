<template>
  <div>
    <q-editor :value="value" :dense="$q.screen.lt.md" :toolbar="toolbar"
      :definitions="uploadUrl?definitions:{}" :fonts="fonts" @input="onUpdateValue" />
    <!-- Dialog Files -->
    <q-dialog v-if="uploadUrl" v-model="dialogFiles">
      <q-card style="width:672px;max-width:80vw;">
        <q-toolbar>
          <q-toolbar-title>{{$t('files.title')}}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip>{{$t('global.cancel')}}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-separator />
        <q-card-section>
          <tm-files :selected.sync="files" :accept="accept" :multiple="multiple" :url="uploadUrl"
            :headers="headers" @on-finish="onFilesFinish">
          </tm-files>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Dialog Upload-->
    <q-dialog v-if="uploadUrl" v-model="dialogUpload">
      <q-card style="width:500px;max-width:80vw;">
        <q-toolbar>
          <q-toolbar-title>{{$t('files.upload')}}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip>{{$t('global.cancel')}}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-separator />
        <q-card-section>
          <q-uploader ref="upload" square flat :multiple="multiple" :max-file-size="maxFileSize"
            :accept="accept" style="width:100%" @uploaded="onUploaded" @finish="dialogUpload=false"
            :url="uploadUrl" :headers="headers">
          </q-uploader>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import tmFiles from '@/components/tm-files'
export default {
  components: { tmFiles },
  props: {
    value: { type: String },
    uploadUrl: { type: String, default: null },
    headers: { type: Array, default: null },
    accept: { type: String, default: '.jpg,.jpeg,.png,.gif' },
    maxFileSize: { type: Number, default: 1024 * 1024 * 2 },
    multiple: { type: Boolean, default: false }
  },
  data() {
    return {
      dialogFiles: false,
      dialogUpload: false,
      files: [],
      toolbar: [
        [
          {
            icon: this.$q.iconSet.editor.align,
            fixedLabel: true,
            list: 'only-icons',
            options: ['left', 'center', 'right', 'justify']
          },
          {
            icon: this.$q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'code'
            ]
          },
          {
            icon: this.$q.iconSet.editor.fontSize,
            fixedLabel: false,
            fixedIcon: false,
            list: 'no-icons',
            options: [
              'size-1',
              'size-2',
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          },
          {
            icon: this.$q.iconSet.editor.font,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'default_font',
              'arial',
              'arial_black',
              'comic_sans',
              'courier_new',
              'impact',
              'lucida_grande',
              'times_new_roman',
              'verdana'
            ]
          },
          'removeFormat'
        ],
        ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
        ['undo', 'redo'],
        ['token', 'hr', 'link', 'loadFile', 'upload'],
        ['viewsource', 'print', 'fullscreen']
      ],
      definitions: {
        loadFile: {
          tip: this.$t('files.open_file'),
          icon: 'pageview',
          handler: this.onEditorOpenFile
        },
        upload: {
          tip: this.$t('files.upload'),
          icon: 'cloud_upload',
          handler: this.onEditorUpload
        }
      },
      fonts: {
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana'
      }
    }
  },
  methods: {
    onEditorOpenFile() {
      this.dialogFiles = true
    },
    onEditorUpload() {
      this.dialogUpload = true
    },
    onFilesFinish(selected) {
      const _files = selected.map(x => x.fullName)
      let _value = ''
      for (const e of _files) {
        _value += this.onGetImg(e)
      }
      this.$emit('update:value', this.value + _value)
      this.dialogFiles = false
    },
    onUploaded(info) {
      const res = JSON.parse(info.xhr.response)
      if (res.length > 0) this.$emit('update:value', this.value + this.onGetImg(res[0].fullName))
    },
    onGetImg(url) {
      return `<p style="text-align:center;"><img src="${url}" style="margin:0px;padding:0px;box-sizing:border-box;border:0px;line-height:0;max-width:100%;width:500px"/></p>`
    },
    onUpdateValue(value) {
      this.$emit('update:value', value)
    }
  }
}
</script>

<style>
</style>
