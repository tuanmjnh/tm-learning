<template>
  <q-card flat bordered :style="$q.platform.is.mobile?{width:'100%'}:{minWidth:'800px'}">
    <q-toolbar>
      <q-avatar :icon="$route.meta.icon" size="50px" />
      <q-toolbar-title>
        {{this.item?$t('global.update'):$t('global.add')}}
        <span class="text-weight-bold">{{$t('route.product')}}</span>
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
        <q-tab name="about" :label="$t('tabs.about')" />
        <q-tab name="images" :label="$t('global.images')" />
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
                :labelClose="$t('global.cancel')" @on-selected="onSelectCategory" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-input v-model.trim="form.title" v-uppercaseFirst
                :dense="$store.getters.dense.input" :label="$t('product.name')"
                :rules="[v=>!!v||$t('error.required')]" />
            </div>
            <q-space />
            <div class="col-12 col-md-5">
              <q-input v-model.trim="form.code" v-uppercase debounce="500"
                :dense="$store.getters.dense.input" :label="$t('product.code')"
                :rules="[v=>!!v||$t('error.required'),v=>!existCode||$t('error.exist')]" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-5">
              <q-input v-model.trim="form.price" type="number" :dense="$store.getters.dense.input"
                :label="$t('product.price_sale')" />
            </div>
            <q-space />
            <div class="col-5">
              <q-input v-model="form.price_discount" type="number"
                :dense="$store.getters.dense.input" :label="$t('product.price_discount')" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-5">
              <q-input v-model="form.price_import" type="number" :dense="$store.getters.dense.input"
                :label="$t('product.price_import')" />
            </div>
            <q-space />
            <div class="col-5">
              <q-input v-model="form.price_export" type="number" :dense="$store.getters.dense.input"
                :label="$t('product.price_export')" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-3">
              <q-input v-model="form.quantity" type="number" :dense="$store.getters.dense.input"
                :label="$t('product.quantity_store')" />
            </div>
            <div class="col-2">
              <q-select v-model="unit" use-input hide-selected fill-input input-debounce="200"
                :dense="$store.getters.dense.input" :options="unitsLocal" :hint="$t('global.unit')"
                @filter="onFilterUnit" option-value="_id" :option-label="opt=>opt.name.toHtml()"
                :rules="[v=>!!v||$t('error.required')]">
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section>
                      <q-item-label v-html="scope.opt.name" />
                      <q-item-label v-if="scope.opt.desc" caption>{{`${scope.opt.desc}`}}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">{{$t('table.no_data')}}</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-2">
              <q-select v-model="unitPrice" :dense="$store.getters.dense.input"
                :options="unitsPriceLocal" use-input hide-selected fill-input input-debounce="200"
                @filter="onFilterUnitPrice" :hint="$t('product.price_unit')" option-value="_id"
                :option-label="opt=>opt.name.toHtml()" :rules="[v=>!!v||$t('error.required')]">
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section>
                      <q-item-label v-html="scope.opt.name"></q-item-label>
                      <!-- <q-item-label>{{scope.opt.name.toHtml()}}</q-item-label> -->
                      <q-item-label v-if="scope.opt.desc" caption>{{`${scope.opt.desc}`}}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">{{$t('table.no_data')}}</q-item-section>
                  </q-item>
                </template>
              </q-select>
              <!-- <q-input v-model="form.price_unit" type="number" :dense="$store.getters.dense.input" :label="$t('global.price_unit')" /> -->
            </div>
            <q-space />
            <div class="col-3">
              <q-input v-model="form.order" type="number" :dense="$store.getters.dense.input"
                :label="$t('global.order')" :rules="[v=>!!v||$t('error.required')]"
                class="col-md-4" />
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="about">
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-input v-model.trim="form.origin" :dense="$store.getters.dense.input"
                :label="$t('product.origin')" />
            </div>
            <q-space />
            <div class="col-12 col-md-6">
              <q-input v-model.trim="form.date" :dense="$store.getters.dense.input"
                :label="$t('product.date')" />
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
              <!-- <q-editor v-model="form.content" min-height="5rem" /> -->
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="images">
          <div class="row">
            <div class="col-12 q-gutter-sm images">
              <tm-upload :data.sync="form.images" :upload-url="uploadUrl" :headers="headers"
                :max-file-size="1024*1024*2" accept=".jpg,.jpeg,.png,.gif" :multiple="true"
                :view-type.sync="viewType" :size="121" :labelTitle="$t('files.title')"
                :labelAccept="$t('global.select')" :labelViewList="$t('files.View_list')"
                :labelViewBox="$t('files.view_box')" :labelFileName="$t('files.file_name')"
                :labelFileSize="$t('files.file_size')"
                :labelConfirmTitle="$t('message_box.confirm')"
                :labelConfirmContent="$t('message_box.delete')">
              </tm-upload>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="attributes">
          <div class="row q-gutter-md">
            <div class="col">
              {{$t('global.pin')}}:
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
import * as api from '@/api/products'
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
    categories: { type: Array, default: null },
    units: { type: Array, default: () => [] },
    unitsPrice: { type: Array, default: () => [] },
    pins: { type: Array, default: () => [] }
  },
  data() {
    return {
      loading: false,
      loadingAdd: false,
      loadingDrafts: false,
      dialogFiles: false,
      dialogUpload: false,
      tabs: 'main',
      form: {},
      attrKeys: [],
      attrValues: [],
      unit: null,
      unitPrice: null,
      existCode: false,
      unitsLocal: [],
      unitsPriceLocal: [],
      viewType: 'box',
      uploadUrl: process.env.API_FILE_UPLOAD,
      headers: [
        { name: 'Upload-Path', value: 'products' },
        { name: 'Upload-Rename', value: true },
        { name: 'x-access-token', value: `Bearer ${this.$store.state.auth.token}` }],
      default: {
        categories: null,
        title: null,
        code: null,
        desc: null,
        content: '',
        images: null,
        quantity: 0,
        price: 0,
        price_discount: 0,
        price_import: 0,
        price_export: 0,
        price_unit: null,
        unit: null,
        origin: null,
        date: null,
        pin: [],
        tags: null,
        attr: [],
        meta: null,
        order: 1,
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
          if (!this.form.content) this.form.content = ''
          this.form.unit = this.units.find(x => x._id === this.form.unit)
          this.form.price_unit = this.unitsPrice.find(x => x._id === this.form.price_unit)
        }
      },
      deep: true,
      immediate: true
    },
    'form.code'(val) {
      if (val) {
        api.exist({ code: val.toUpperCase() }).then((x) => {
          if (x) this.existCode = true
        })
      }
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
    onFilterUnit(val, update, abort) {
      update(() => {
        if (val === '') {
          this.unitsLocal = this.units
        } else {
          const needle = normalize(val.toLowerCase())
          // this.form.region = this.regions.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
          this.unitsLocal = this.units.filter(v => normalize(v.name.toLowerCase()).indexOf(needle) > -1)
        }
      })
    },
    onFilterUnitPrice(val, update, abort) {
      update(() => {
        if (val === '') {
          this.unitsPriceLocal = this.unitsPrice
        } else {
          const needle = normalize(val.toLowerCase())
          // this.form.region = this.regions.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
          this.unitsPriceLocal = this.unitsPrice.filter(v => normalize(v.name.toLowerCase()).indexOf(needle) > -1)
        }
      })
    },
    onSelectCategory(item) {
      if (!item.children || !item.children.length) {
        this.form.categories = [item._id]
      }
    },
    onSubmit(action) {
      if (this.unit) this.form.unit = this.unit.name
      if (this.unitPrice) this.form.price_unit = this.unitPrice.name
      // this.form.images = this.images.map(x => x.fullName)
      this.$refs.form.validate().then(valid => {
        if (valid) {
          if (this.item) {
            this.loadingAdd = true
            api.update(this.form).then((x) => {
              if (x.ok) {
                const index = this.items.indexOf(this.item)
                if (index > -1) this.items.splice(index, 1, this.form)
              }
            }).finally(() => {
              this.loadingAdd = false
            })
          } else {
            this.form.flag = action
            if (action) this.loadingAdd = true
            else this.loadingDrafts = true
            api.insert(this.form).then((x) => {
              this.items.push(x)
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
        this.form.images = []
        this.unit = this.units[0]
        this.unitPrice = this.unitsPrice[0]
        resolve()
      }).then(() => {
        if (this.$refs.form) this.$refs.form.resetValidation()
      })
    }
  }
}
</script>

<style scoped>
.images {
  min-height: 100px;
}
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
