<template>
  <q-card style="width:700px;max-width:80vw">
    <q-toolbar>
      <q-avatar :icon="$route.meta.icon" size="50px" />
      <q-toolbar-title>
        {{ this.item ? $t("global.update") : $t("global.add") }}
        <span class="text-weight-bold">{{$t("route.category")}}
          {{$t(`route.${$route.meta.type}`)}}</span>
      </q-toolbar-title>
      <q-btn flat round dense icon="close" v-close-popup
        :disable="loading_add || loading_drafts ? true : false">
        <q-tooltip v-if="!$q.platform.is.mobile">{{ $t("global.cancel") }}</q-tooltip>
      </q-btn>
    </q-toolbar>
    <q-separator />
    <q-form ref="form">
      <q-card-actions v-if="item" align="right">
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="amber"
          icon="offline_pin" :label="$t('global.update')" :loading="loading_add"
          @click.prevent="onSubmit">
          <!-- <q-tooltip>{{$t('global.add')}}</q-tooltip> -->
        </q-btn>
      </q-card-actions>
      <q-card-actions v-else align="right">
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="blue"
          icon="check_circle" :label="$t('global.add')" :loading="loading_add"
          :disable="loading_drafts" @click.prevent="onSubmit(1)">
          <!-- <q-tooltip>{{$t('global.add')}}</q-tooltip> -->
        </q-btn>
        <q-btn flat type="submit" :dense="$store.getters.dense.button" color="amber" icon="receipt"
          :label="$t('global.drafts')" :loading="loading_drafts" :disable="loading_add"
          @click.prevent="onSubmit(0)">
          <!-- <q-tooltip>{{$t('global.drafts')}}</q-tooltip> -->
        </q-btn>
      </q-card-actions>
      <q-tabs v-model="tabs" narrow-indicator :dense="$store.getters.dense.form"
        class="text-deep-purple" align="justify">
        <q-tab name="main" :label="$t('tabs.main')" />
        <q-tab name="content" :label="$t('global.content')" />
        <q-tab name="images" :label="$t('global.images')" />
        <q-tab name="attributes" :label="$t('global.attributes')" />
      </q-tabs>
      <q-separator />
      <!-- <q-card-section> -->
      <q-tab-panels v-model="tabs" animated>
        <q-tab-panel name="main">
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              Parent:
              <q-badge color="blue">{{ dependent ? dependent.label : "Root" }}</q-badge>
            </div>
            <q-space />
            <div class="col-12 col-md-6">
              Level:
              <q-badge color="blue">{{ form.level }}</q-badge>
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-input v-model.trim="form.title" v-uppercaseFirst
                :dense="$store.getters.dense.input" :label="$t('global.title')"
                :rules="[v=>!!v||$t('error.required')]" />
            </div>
            <q-space />
            <div class="col-12 col-md-6">
              <q-input v-model.trim="form.code" v-uppercase :dense="$store.getters.dense.input"
                debounce="300" :label="$t('global.code')" :hint="$t('category.hit_code')"
                :rules="[v=>!!v||$t('error.required'),v=>!existCode||$t('error.exist')]" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-input v-model.trim="form.url" :dense="$store.getters.dense.input" v-lowercase
                label="URL" />
            </div>
            <q-space />
            <div class="col-12 col-md-6">
              <q-input v-model="form.quantity" type="number" :dense="$store.getters.dense.input"
                :label="$t('global.quantity')" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-input v-model.trim="form.icon" :dense="$store.getters.dense.input" label="Icon">
                <template v-slot:append>
                  <q-icon :name="form.icon" />
                </template>
              </q-input>
            </div>
            <q-space />
            <div class="col col-md-6 self-center">
              {{ $t("global.color_pick") }}:
              <q-badge :style="{ backgroundColor: form.color }" @click="dialog_color_pick = true">
                {{ form.color }}
              </q-badge>
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-input :value="form.start_at ? $moment(form.start_at).format('DD/MM/YYYY') : ''"
                :dense="$store.getters.dense.input" readonly :label="$t('global.start_date')"
                :hint="`${$t('global.format')}: DD/MM/YYYY`">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="startAt" transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.start_at" today-btn
                        @input="() => $refs.startAt.hide()" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <q-space />
            <div class="col col-md-6">
              <q-input :value="form.end_at ? $moment(form.end_at).format('DD/MM/YYYY') : ''"
                :dense="$store.getters.dense.input" readonly :label="$t('global.end_date')"
                :hint="`${$t('global.format')}: DD/MM/YYYY`">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="endAt" transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.end_at" today-btn @input="() => $refs.endAt.hide()" />
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
            <q-space v-if="item" />
            <div class="col-5 self-center" v-if="item">
              <q-toggle v-model="form.flag" :true-value="1" :dense="$store.getters.dense.input"
                :label="form.flag ? $t('global.publish') : $t('global.drafts')" />
            </div>
          </div>
          <div class="q-gutter-sm">
            <q-input v-model.trim="form.desc" autogrow :dense="$store.getters.dense.input"
              :label="$t('global.desc')" />
          </div>
        </q-tab-panel>
        <q-tab-panel name="content">
          <q-editor v-model="form.content" min-height="5rem" />
        </q-tab-panel>
        <q-tab-panel name="images">
          <div class="row">
            <div class="col-12 q-gutter-sm images">
              <tm-upload :data.sync="form.images" :upload-url="uploadUrl" :headers="headers"
                :max-file-size="1024 * 1024 * 2" accept=".jpg, .jpeg, .png, .gif" :multiple="false"
                :view-type.sync="viewType" :size="121" :labelTitle="$t('files.title')"
                :labelViewList="$t('files.View_list')" :labelViewBox="$t('files.view_box')"
                :labelFileName="$t('files.file_name')" :labelFileSize="$t('files.file_size')"
                :labelConfirmTitle="$t('message_box.confirm')"
                :labelConfirmContent="$t('message_box.delete')">
              </tm-upload>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="attributes">
          <div class="q-pt-md q-pb-md">
            <span>{{ $t("global.position") }}:</span>
            <q-option-group v-model="form.position" :options="positions" color="green"
              type="checkbox" inline :dense="$store.getters.dense.input" />
          </div>
          <q-separator class="q-mt-md" />
          <tm-tags :data.sync="form.tags" :dense="$store.getters.dense.input"
            :labelTitle="$t('global.keyword') + ':'" :labelBtnAdd="$t('global.add')"
            :labelInput="$t('global.tags')" btnIcon="add" btnColor="blue" tagsColor="primary"
            tagsTextColor="white" :labelConfirmTitle="$t('message_box.confirm')"
            :labelConfirmContent="$t('message_box.delete')"
            :labelWarningTitle="$t('message_box.warning')"
            :labelWarningContent="$t('error.required')"></tm-tags>
          <q-separator class="q-mb-md q-mt-md" />
          <tm-attributes :data.sync="form.attr" :keys="attrKeys" :values="attrValues"
            :dense="$store.getters.dense.input" :labelTitle="$t('product.attributes') + ':'"
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
    <!-- Dialog color pick -->
    <q-dialog v-model="dialog_color_pick">
      <q-card>
        <q-toolbar>
          <q-toolbar-title>{{ $t("global.color_pick") }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip>{{ $t("global.cancel") }}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-card-section>
          <q-color v-model="form.color" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { axiosApi, axiosApiDebonce } from '@/utils/http-client';
import tmUpload from '@/components/tm-upload'
import tmTags from '@/components/tm-tags'
import tmAttributes from '@/components/tm-attributes'
export default {
  components: { tmUpload, tmTags, tmAttributes },
  props: {
    dialog: { type: Boolean, default: true },
    item: { type: Object, default: () => { } },
    items: { type: Array, default: () => [] },
    dependent: { type: Object, default: () => null },
    positions: { type: Array, default: () => [] },
    expanded: { type: Array, default: () => [] }
  },
  data() {
    return {
      loading: false,
      loading_add: false,
      loading_drafts: false,
      dialog_color_pick: false,
      dialogFiles: false,
      dialogUpload: false,
      tabs: 'main',
      existCode: false,
      form: {},
      attrKeys: [],
      attrValues: [],
      viewType: 'box',
      uploadUrl: process.env.API_FILE_UPLOAD,
      headers: [
        { name: 'Upload-Path', value: 'category' },
        { name: 'Upload-Rename', value: true },
        { name: 'x-access-token', value: `Bearer ${this.$store.state.auth.token}` }],
      default: {
        type: this.$route.meta.type,
        code: null,
        dependent: null,
        level: 1,
        title: '',
        desc: null,
        content: '',
        url: null,
        images: null,
        quantity: null,
        position: [],
        tags: null,
        icon: 'spa',
        color: '#009688',
        meta: null,
        start_at: null, // this.$moment().format('YYYY/MM/DD'),
        end_at: null, // this.$moment().format('YYYY/MM/DD'),
        orders: 1,
        flag: 1
      }
    }
  },
  watch: {
    dialog: {
      handler(val) {
        this.reset()
        if (this.item) this.form = { ...this.item }
      },
      deep: true,
      immediate: true
    },
    'form.code'(val) {
      if (val) {
        axiosApiDebonce({ method: 'get', params: { code: val.toUpperCase() }, url: 'categories/exist' }).then((x) => {
          this.existCode = x
          // console.log(this.existCode)
        })
      }
    }
  },
  methods: {
    onFilterAttrKey(val) {
      let data = { key: true }
      if (val) data.filter = val
      this.attrKeys = []
      axiosApiDebonce.get({ method: 'get', params: data, url: 'categories/get-attr' }).then((x) => {
        if (x) this.attrKeys = x.data
      })
    },
    onFilterAttrValue(val) {
      let data = {}
      if (val) data.filter = val
      this.attrValues = []
      axiosApiDebonce.get({ method: 'get', params: data, url: 'categories/get-attr' }).then((x) => {
        if (x) this.attrValues = x.data
      })
    },
    getDependent() {
      if (this.dependent) return this.dependent.label
      else return 'Root'
    },
    onSubmit(action) {
      this.$refs.form.validate().then(valid => {
        if (valid) {
          if (this.item) { // Update
            this.loading_add = true
            axiosApi.put('categories', this.form).then((x) => {
              if (x.ok) {
                this.form.label =
                  this.form.meta && this.form.meta.label ? this.$t(`category.${this.form.meta.label}`) : this.form.title;
                if (!this.dependent) {
                  const index = this.items.indexOf(this.item)
                  if (index > -1) this.items.splice(index, 1, this.form)
                } else {
                  const index = this.dependent.children.indexOf(this.item)
                  if (index > -1) this.dependent.children.splice(index, 1, this.form)
                }
              }
            }).finally(() => {
              this.loading_add = false
            })
          } else { // Insert
            this.form.flag = action
            if (action) this.loading_add = true
            else this.loading_drafts = true
            axiosApi.post('categories', this.form).then((x) => {
              if (x) {
                x.label =
                  x.meta && x.meta.label ? this.$t(`category.${x.meta.label}`) : x.title;
                if (this.dependent) {
                  this.expanded.push(x._id)
                  if (!this.dependent.children) this.dependent.children = []
                  this.dependent.children.push(x)
                } else this.items.push(x)
              }
            }).finally(() => {
              this.loading_add = false
              this.loading_drafts = false
              this.reset()
            })
          }
        }
      })
    },
    findRoutes(routes, val, by) {
      const rs = []
      for (let e of routes) {
        if (e[by] === val) return e
      }
    },
    reset() {
      new Promise((resolve, reject) => {
        this.form = { ...this.default }
        if (this.dependent) {
          this.form.dependent = this.dependent._id
          this.form.level = this.dependent.level + 1
        }
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
.images .q-img {
  height: 100px;
  max-width: 100px;
}
.img-delete {
  color: #fff;
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  background-color: #b71c1c;
  display: none;
}
.images .q-img:hover .img-delete {
  display: initial;
}
</style>
