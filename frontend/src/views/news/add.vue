<template>
  <q-card style="width:700px;max-width:80vw">
    <q-toolbar>
      <q-avatar :icon="$route.meta.icon" size="50px" />
      <q-toolbar-title>
        {{this.item?$t('global.update'):$t('global.add')}}
        <span class="text-weight-bold">{{$t('route.news')}}</span>
      </q-toolbar-title>
      <q-btn flat round dense icon="close" v-close-popup
        :disable="loadingAdd||loadingDrafts?true:false">
        <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.cancel')}}</q-tooltip>
      </q-btn>
    </q-toolbar>
    <q-separator />
    <q-form ref="form">
      <q-card-actions v-if="item" align="right">
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="amber"
          icon="offline_pin" :label="$t('global.update')" :loading="loadingAdd"
          @click.prevent="onSubmit">
          <!-- <q-tooltip>{{$t('global.add')}}</q-tooltip> -->
        </q-btn>
      </q-card-actions>
      <q-card-actions v-else align="right">
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="blue"
          icon="check_circle" :label="$t('global.add')" :loading="loadingAdd"
          :disable="loadingDrafts" @click.prevent="onSubmit(1)">
          <!-- <q-tooltip>{{$t('global.add')}}</q-tooltip> -->
        </q-btn>
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="amber" icon="receipt"
          :label="$t('global.drafts')" :loading="loadingDrafts" :disable="loadingAdd"
          @click.prevent="onSubmit(0)">
          <!-- <q-tooltip>{{$t('global.drafts')}}</q-tooltip> -->
        </q-btn>
      </q-card-actions>
      <q-tabs v-model="tabs" narrow-indicator :dense="$store.getters.dense.form"
        class="text-deep-purple" align="justify">
        <q-tab name="main" :label="$t('tabs.main')" />
        <q-tab name="upload" :label="$t('files.upload')" />
        <q-tab name="attributes" :label="$t('global.attributes')" />
      </q-tabs>
      <q-separator />
      <!-- <q-card-section> -->
      <q-tab-panels v-model="tabs" animated>
        <q-tab-panel name="main">
          <div class="row q-gutter-xs">
            <div class="col-12">
              <select-category :categories="categories" :selected.sync="form.categories"
                data-key="_id" :dense="$store.getters.dense.input"
                :labelTitle="$t('category.title_product')" :labelSelect="$t('category.select')"
                :labelClose="$t('global.cancel')" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-12">
              <q-input v-model.trim="form.title" v-uppercaseFirst
                :dense="$store.getters.dense.input" :label="$t('news.name')"
                :rules="[v=>!!v||$t('error.required')]" />
            </div>
            <!-- <q-space />
            <div class="col-12 col-md-3">
              <q-input v-model.trim="form.code" readonly v-uppercase debounce="300"
                :dense="$store.getters.dense.input" :label="$t('news.code')"
                :rules="[v=>v&&v.length>0||$t('error.required')]" />
            </div> -->
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-input v-model.trim="form.author" :dense="$store.getters.dense.input"
                :label="$t('news.author')" />
            </div>
            <q-space />
            <div class="col-12 col-md-6">
              <q-input :value="form.date?$moment(form.date).format($store.getters.format.date):''"
                :dense="$store.getters.dense.input" readonly :label="$t('news.date')"
                :hint="`${$t('global.format')}: ${$store.getters.format.date}`">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="datePublish" transition-show="scale"
                      transition-hide="scale">
                      <q-date v-model="form.date" today-btn @input="()=>$refs.datePublish.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-input
                :value="form.start_at?$moment(form.start_at).format($store.getters.format.date):''"
                :dense="$store.getters.dense.input" readonly :label="$t('global.start_date')"
                :hint="`${$t('global.format')}: ${$store.getters.format.date}`">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="startAt" transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.start_at" today-btn @input="()=>$refs.startAt.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <q-space />
            <div class="col col-md-6">
              <q-input
                :value="form.end_at?$moment(form.end_at).format($store.getters.format.date):''"
                :dense="$store.getters.dense.input" readonly :label="$t('global.end_date')"
                :hint="`${$t('global.format')}: ${$store.getters.format.date}`">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="endAt" transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.end_at" today-btn @input="()=>$refs.endAt.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-3">
              <q-input v-model="form.orders" type="number" :dense="$store.getters.dense.input"
                :label="$t('global.order')" :rules="[v=>!!v||$t('error.required')]"
                class="col-md-4" />
            </div>
          </div>
          <div class="row q-gutter-sm q-mb-lg">
            <div class="col-12">
              <q-input v-model.trim="form.desc" autogrow :dense="$store.getters.dense.input"
                :label="$t('global.desc')" />
            </div>
          </div>
          <div class="row q-gutter-sm">
            <div class="col-12">{{$t('global.content')}}</div>
            <div class="col-12">
              <tm-editor :value.sync="form.content" :upload-url="uploadUrl" :headers="headers"
                multiple :max-file-size="1024*1024*2" accept=".jpg,.jpeg,.png,.gif"></tm-editor>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="upload">
          <div class="row">
            <div class="col-12 q-gutter-sm images">
              <tm-upload :data.sync="form.images" :upload-url="uploadUrl" :headers="headers"
                :max-file-size="1024*1024*2" accept=".jpg,.jpeg,.png,.gif" :multiple="false"
                :view-type.sync="viewTypeImage" :size="121" :labelTitle="$t('files.title')"
                :labelViewList="$t('files.View_list')" :labelViewBox="$t('files.view_box')"
                :labelFileName="$t('files.file_name')" :labelFileSize="$t('files.file_size')"
                :labelConfirmTitle="$t('message_box.confirm')"
                :labelConfirmContent="$t('message_box.delete')">
              </tm-upload>
            </div>
          </div>
          <q-separator class="q-mb-sm q-mt-sm" />
          <div class="row">
            <div class="col-12 q-gutter-sm images">
              <tm-upload :data.sync="form.attach" :upload-url="uploadUrl" :headers="headers"
                :max-file-size="1024*1024*5" :multiple="true" :view-type.sync="viewTypeAttach"
                :size="121" :labelTitle="$t('files.title')" :labelViewList="$t('files.View_list')"
                :labelViewBox="$t('files.view_box')" :labelFileName="$t('files.file_name')"
                :labelFileSize="$t('files.file_size')"
                :labelConfirmTitle="$t('message_box.confirm')"
                :labelConfirmContent="$t('message_box.delete')">
              </tm-upload>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="attributes">
          <div class="q-pt-md q-pb-md">
            <div class="col-12">{{$t('global.pin')}}:</div>
            <div class="col-12">
              <q-option-group v-model="form.pin" :options="pins" type="checkbox" inline
                :dense="$store.getters.dense.input" />
            </div>
          </div>
          <q-separator class="q-mt-md" />
          <tm-tags :data.sync="form.tags" :dense="$store.getters.dense.input"
            :labelTitle="$t('global.keyword')+':'" :labelBtnAdd="$t('global.add')"
            :labelInput="$t('global.tags')" btnIcon="add" btnColor="blue" tagsColor="primary"
            tagsTextColor="white" :labelConfirmTitle="$t('message_box.confirm')"
            :labelConfirmContent="$t('message_box.delete')"
            :labelWarningTitle="$t('message_box.warning')"
            :labelWarningContent="$t('error.required')"></tm-tags>
          <q-separator class="q-mb-md q-mt-md" />
          <tm-attributes :data.sync="form.attr" :keys="attrKeys" :values="attrValues"
            :dense="$store.getters.dense.input" :labelTitle="$t('product.attributes')+':'"
            :labelBtnAdd="$t('global.add')" :labelInputKey="$t('global.key')"
            :labelInputValue="$t('global.value')" btnIcon="add" btnColor="blue"
            :btnEditLabel="$t('global.edit')" :btnDeleteLabel="$t('global.delete')"
            :labelConfirmTitle="$t('message_box.confirm')"
            :labelConfirmContent="$t('message_box.delete')"
            :labelWarningTitle="$t('message_box.warning')"
            :labelWarningContent="$t('error.required')" :labelNoData="$t('table.no_data')"
            @on-filter-key="onFilterAttrKey" @on-filter-value="onFilterAttrValue">
          </tm-attributes>
        </q-tab-panel>
      </q-tab-panels>
      <!-- </q-card-section> -->
    </q-form>
  </q-card>
</template>

<script>
import * as api from '@/api/news'
import normalize from '@/utils/search'
import tmEditor from '@/components/tm-editor'
import tmUpload from '@/components/tm-upload'
import tmTags from '@/components/tm-tags'
import tmAttributes from '@/components/tm-attributes'
import selectCategory from '@/views/category/components/select-category'
export default {
  components: { tmEditor, tmUpload, tmTags, tmAttributes, selectCategory },
  props: {
    dialog: { type: Boolean, default: true },
    items: { type: Array, default: () => [] },
    item: { type: Object, default: () => { } },
    categories: { type: Array, default: () => [] },
    pins: { type: Array, default: () => [] }
  },
  data() {
    return {
      loading: false,
      loadingAdd: false,
      loadingDrafts: false,
      dialogCategories: false,
      dialogFiles: false,
      dialogUpload: false,
      openType: 'image',
      tabs: 'main',
      form: {},
      attrKeys: [],
      attrValues: [],
      viewTypeImage: 'box',
      viewTypeAttach: 'list',
      uploadUrl: process.env.API_FILE_UPLOAD,
      headers: [
        { name: 'Upload-Path', value: 'news' },
        { name: 'Upload-Rename', value: true },
        { name: 'x-access-token', value: `Bearer ${this.$store.state.auth.token}` }],
      default: {
        categories: null,
        title: null,
        code: null,
        desc: null,
        content: '',
        url: null,
        images: null,
        author: null,
        date: null,
        pin: [],
        tags: null,
        attr: [],
        meta: null,
        attach: [],
        start_at: null,
        end_at: null,
        orders: 1,
        flag: 1
      }
    }
  },
  watch: {
    dialog: {
      handler(val) {
        this.reset()
        if (this.item) {
          this.form = { ...this.item }
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onFilterAttrKey(val) {
      let data = { key: true }
      if (val) data.filter = val
      this.attrKeys = []
      api.getAttr(data).then((x) => {
        if (x) this.attrKeys = x.data
      })
    },
    onFilterAttrValue(val) {
      let data = {}
      if (val) data.filter = val
      this.attrValues = []
      api.getAttr(data).then((x) => {
        if (x) this.attrValues = x.data
      })
    },
    // onSelectCategory(item) {
    //   this.form.categories = item._id
    // },
    onSubmit(action) {
      this.$refs.form.validate().then(valid => {
        if (valid) {
          if (this.item) {
            this.loadingAdd = true
            api.update(this.form).then((x) => {
              if (x.ok) {
                if (!this.dependent) {
                  const index = this.items.indexOf(this.item)
                  if (index > -1) this.items.splice(index, 1, this.form)
                } else {
                  const index = this.dependent.children.indexOf(this.item)
                  if (index > -1) this.dependent.children.splice(index, 1, this.form)
                }
              }
            }).finally(() => {
              this.loadingAdd = false
            })
          } else {
            this.form.flag = action
            if (action) this.loadingAdd = true
            else this.loadingDrafts = true
            api.insert(this.form).then((x) => {
              if (this.dependent) {
                this.expanded.push(x._id)
                if (!this.dependent.children) this.dependent.children = []
                this.dependent.children.push(x)
              } else this.items.push(x)
            }).finally(() => {
              this.loadingAdd = false
              this.loadingDrafts = false
              this.reset()
            })
          }
        }
      })
    },
    reset() {
      new Promise((resolve, reject) => {
        this.form = { ...this.default }
        this.form.images = null
        this.attr = {}
        this.tag = ''
        resolve()
      }).then(() => {
        if (this.$refs.form) this.$refs.form.resetValidation()
      })
    }
  }
}
</script>

<style>
</style>
