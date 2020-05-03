<template>
  <q-card flat bordered>
    <q-toolbar>
      <q-toolbar-title>{{$t('product.warehouse_export')}}</q-toolbar-title>
      <q-btn v-if="!result&&items&&items.length" type="submit" no-caps
        :dense="$store.getters.dense.button" color="blue" :label="$t('product.export')"
        :loading="loading" class="q-btn--square q-mr-sm" @click.prevent="onSubmit" />
      <!--icon="offline_pin" -->
      <q-btn v-if="items&&items.length" type="submit" no-caps :dense="$store.getters.dense.button"
        color="blue-grey-4" :label="$t('product.create_new')" :loading="loading"
        class="q-btn--square" @click.prevent="onCreateNew" />
    </q-toolbar>
    <q-separator />
    <q-form ref="form">
      <q-table :data="items" :columns="columns" row-key="code" flat
        :visible-columns="visibleColumns"
        :loading="$store.state.loading.get||$store.state.loading.patch" :selected.sync="selected"
        selection="multiple" :dense="$store.getters.dense.table"
        :no-data-label="$t('table.no_data')" :no-results-label="$t('table.no_filter_data')"
        :rows-per-page-label="$t('table.row_per_page')"
        :selected-rows-label="()=>`${selected.length} ${$t('table.row_selected')}`"
        :rows-per-page-options="[10, 20, 50 ,100, 200, 0]" :pagination.sync="pagination">
        <template v-slot:top="props">
          <div class="col-12 row">
            <div v-if="result" class="col-xs-12 col-sm-auto self-center">
              <span>{{$t('product.export_success')}}</span><b
                class="text-positive">{{result.data.code}}</b>
            </div>
            <q-space />
            <div class="col-xs-12 col-sm-auto self-center text-right">
              <div class="col-auto self-center">
                <q-btn v-if="selected&&selected.length" flat round dense color="negative"
                  icon="delete" @click="onRemove()">
                  <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.delete')}}</q-tooltip>
                </q-btn>
                <!-- <q-btn v-if="result" flat round dense color="indigo" icon="print" @click="onPrint">
                  <q-tooltip v-if="!$q.platform.is.mobile">{{$t('product.print')}}</q-tooltip>
                </q-btn> -->
                <printer-form v-if="result" :title="$t('product.export_ballot')"
                  :label="$t('product.print')" :labelDate="$t('product.export_date')" :items="items"
                  :result="result" />
                <q-btn v-if="!result" flat round dense color="secondary" icon="find_in_page"
                  @click="onOpenProductList">
                  <q-tooltip v-if="!$q.platform.is.mobile">{{$t('product.select')}}</q-tooltip>
                </q-btn>
                <q-btn v-if="!result" flat round dense color="indigo" icon="cloud_upload"
                  @click="onOpenProductLoad">
                  <q-tooltip v-if="!$q.platform.is.mobile">{{$t('files.open_file')}}</q-tooltip>
                </q-btn>
                <q-btn flat round dense :color="$store.state.app.darkMode?'':'grey-7'"
                  icon="menu_open">
                  <q-tooltip v-if="!$q.platform.is.mobile">{{$t('table.display_columns')}}
                  </q-tooltip>
                  <q-menu fit>
                    <q-list dense style="min-width:120px">
                      <template v-for="(item,index) in columns">
                        <q-item clickable :key="index" v-if="!item.required"
                          @click="onColumns(item.name)"
                          :active="visibleColumns.indexOf(item.name)>-1||false">
                          <q-item-section>{{$t(item.label)}}</q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-menu>
                </q-btn>
                <q-btn flat round dense :color="$store.state.app.darkMode?'':'grey-7'"
                  :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                  @click="props.toggleFullscreen">
                  <q-tooltip v-if="!$q.platform.is.mobile">
                    {{props.inFullscreen?$t('table.normal_screen'):$t('table.full_screen')}}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </template>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width>
              <q-checkbox v-if="props.multipleSelect" v-model="props.selected"
                indeterminate-value="some" :dense="$store.getters.dense.table" />
            </q-th>
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              <span v-if="$store.state.app.darkMode" class="text-bold">{{ $t(col.label) }}</span>
              <span v-else class="text-bold text-blue-grey-10">{{ $t(col.label) }}</span>
            </q-th>
            <q-th auto-width>#</q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-checkbox v-model="props.selected" color="primary"
                :dense="$store.getters.dense.table" />
            </q-td>
            <q-td key="title" :props="props">
              <div>{{ props.row.title }}</div>
              <q-badge v-if="!props.row._id" color="red" transparent floating>new</q-badge>
            </q-td>
            <q-td key="code" :props="props">
              {{ props.row.code }}
            </q-td>
            <q-td key="price" :props="props">
              <div v-if="result">
                <span
                  class="q-pr-xs">{{ props.row.price|NumberFormat($store.getters.language) }}</span>
                <q-badge v-html="props.row.price_unit" color="blue" transparent />
              </div>
              <q-input v-else v-model="props.row.price" debounce="300"
                :label="$t('product.price_export')" type="number"
                :dense="$store.getters.dense.input" class="no-error-icon no-arrows"
                :rules="[v=>!!v||$t('error.required'),v=>parseInt(v)>0||$t('error.min_quanity',{min:1})]">
                <template v-slot:append>
                  <q-icon name="refresh" class="cursor-pointer"
                    @click="props.row.price=props.row.price_old" />
                </template>
              </q-input>
            </q-td>
            <q-td key="quantity" :props="props">
              <div v-if="result">
                <span
                  class="q-pr-xs">{{ props.row.quantity|NumberFormat($store.getters.language) }}</span>
                <q-badge v-html="props.row.unit" color="orange" transparent />
              </div>
              <q-input v-else v-model="props.row.quantity" debounce="300"
                :label="$t('product.quantity_export')" type="number"
                :dense="$store.getters.dense.input" class="no-error-icon no-arrows"
                :rules="[v=>!!v||$t('error.required'),v=>parseInt(v)>0||$t('error.min_quanity',{min:1})]"
                @input="onCheckQuantity(props.row)">
                <template v-slot:append>
                  <q-icon name="arrow_drop_up" class="cursor-pointer"
                    @click="props.row.quantity=props.row.quantity_store" />
                </template>
              </q-input>
            </q-td>
            <q-td key="amount" :props="props">
              {{ props.row.amount=parseInt(props.row.price)*parseInt(props.row.quantity)|NumberFormat($store.getters.language) }}
              <q-badge v-html="props.row.price_unit" color="blue" transparent />
            </q-td>
            <q-td key="quantity_store" :props="props">
              {{ result?props.row.quantity_store-props.row.quantity:props.row.quantity_store|NumberFormat($store.getters.language) }}
              <q-badge v-html="props.row.unit" color="orange" transparent />
            </q-td>
            <q-td key="price_sale" :props="props">
              {{ props.row.price_sale|NumberFormat($store.getters.language) }}
              <q-badge v-html="props.row.price_unit" color="blue" transparent />
            </q-td>
            <q-td key="price_discount" :props="props">
              {{ props.row.price_discount|NumberFormat($store.getters.language) }}
              <q-badge v-html="props.row.price_unit" color="red" transparent />
            </q-td>
            <q-td auto-width class="text-center">
              <q-btn flat round dense icon="close" color="red"
                :size="$store.getters.dense.table?'sm':'md'" @click="onRemove(props.row)">
                <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.cancel')}}</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-form>
    <!-- Product list dialog -->
    <q-dialog v-model="dialogProductList" :maximized="maximizedView" persistent>
      <p-list :categories="categories" :dialog.sync="dialogProductList"
        :maximized.sync="maximizedView" :visible-columns.sync="visibleColumnsList"
        @on-selected="onSelectProduct" />
    </q-dialog>
    <!-- Product load dialog -->
    <q-dialog v-model="dialogProductLoad" :maximized="maximizedView" persistent>
      <q-card style="min-width:800px">
        <q-toolbar>
          <q-avatar :icon="$route.meta.icon" size="50px" />
          <q-toolbar-title>{{$t('files.data_file')}}</q-toolbar-title>
          <q-btn flat round dense :color="$store.state.app.darkMode?'':'grey-7'"
            :icon="maximizedView?'fullscreen_exit':'fullscreen'" :disable="loading"
            @click="maximizedView=!maximized">
            <q-tooltip v-if="!$q.platform.is.mobile">
              {{maximizedView?$t('table.normal_screen'):$t('table.full_screen')}}</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip v-if="!$q.platform.is.mobile">{{$t('global.cancel')}}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-separator />
        <q-card-section class="text-center">
          <tm-load-files :button="true" :label="$t('files.open_file')"
            :placeholder="$t('files.choose_file')" accept=".xls,.xlsx,.csv,.tsv,.txt,.json,.xml"
            @on-start="loading=true" @on-finish="onLoadedFile" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import Cookies from 'js-cookie'
import * as api from '@/api/warehouse/exports'
import * as apiCategories from '@/api/categories'
import pList from '@/views/products/components/list'
import tmLoadFiles from '@/components/tm-load-files'
import printerForm from './components/printer-form'
export default {
  components: { pList, tmLoadFiles, printerForm },
  data() {
    return {
      loading: false,
      dialogProductList: false,
      dialogProductLoad: false,
      maximizedView: false,
      result: null,
      categories: [],
      selected: [],
      items: Cookies.get('export-tmp') ? JSON.parse(Cookies.get('export-tmp')) : [],
      visibleColumns: [],
      visibleColumnsList: ['price', 'price_discount', 'price_export'],
      pagination: {
        page: 1,
        rowsPerPage: 10
      },
      columns: [
        { name: 'title', field: 'title', label: 'product.name', align: 'left', sortable: true, required: true }, // row => this.$t(`roles.${row.name}`)
        { name: 'code', field: 'code', label: 'product.code', align: 'left', sortable: true, required: true },
        { name: 'price', field: 'price', label: 'product.price_export', align: 'right', sortable: true, required: true },
        { name: 'quantity', field: 'quantity', label: 'product.quantity_export', align: 'right', sortable: true, required: true },
        { name: 'amount', field: 'amount', label: 'product.amount', align: 'right', sortable: true, required: true },
        { name: 'quantity_store', field: 'quantity_store', label: 'product.quantity_store', align: 'right', sortable: true, required: true },
        { name: 'price_sale', field: 'price_sale', label: 'product.price_sale', align: 'right', sortable: true },
        { name: 'price_discount', field: 'price_discount', label: 'product.price_discount', align: 'right', sortable: true }
      ]
    }
  },
  created() {
    this.onGetCategory()
    // this.result = {}
  },
  watch: {
    items: {
      handler(val) {
        if (val && val.length) Cookies.set('export-tmp', JSON.stringify(this.items))
        else Cookies.remove('export-tmp')
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onGetCategory() {
      apiCategories.select().then((x) => {
        this.categories = x.data
      })
    },
    onOpenProductList() {
      this.dialogProductList = true
      this.maximizedView = false
    },
    onOpenProductLoad() {
      this.dialogProductLoad = true
      this.maximizedView = false
    },
    onSelectProduct(selected) {
      selected = selected.map(item => ({
        _id: item._id,
        code: item.code.toUpperCase(),
        title: item.title,
        quantity: item.quantity_export || 0,
        price: item.price_export || 0,
        price_old: item.price_export || 0,
        quantity_store: item.quantity || 0,
        price_sale: item.price || 0,
        price_discount: item.price_discount || 0,
        price_unit: item.price_unit,
        unit: item.unit
      }))
      this.items.pushIfNotExist(selected, 'code')
    },
    onLoadedFile(data) {
      if (!data) {
        this.$q.notify({
          message: this.$t('error.exist'),
          color: 'warning'
        })
        return null
      }
      api.finds(data.map(x => x.code)).then(x => {
        if (x && x.length) {
          x.forEach(item => {
            const _item = data.find(x => x.code === item.code)
            this.items.pushIfNotExistUpdate({
              _id: item._id,
              code: item.code.toUpperCase(),
              title: item.title,
              quantity: _item.quantity_export || 0,
              price: _item.price_export || 0,
              price_old: item.price_export || 0,
              quantity_store: item.quantity || 0,
              price_sale: item.price || 0,
              price_discount: item.price_discount || 0,
              price_unit: item.price_unit,
              unit: item.unit
            }, 'code')
          })
        }
      })
        .finally(() => {
          this.loading = false
          this.dialogProductLoad = false
        })
    },
    onRemove(item) {
      if (item) this.selected = [item]
      this.$q.dialog({
        title: this.$t('message_box.confirm'),
        message: this.$t('message_box.delete'),
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.selected.forEach(e => {
          const index = this.items.findIndex(x => x.code === e.code)
          if (index > -1) this.items.splice(index, 1)
        })
        this.selected = []
      })
    },
    onCheckQuantity(item) {
      if (item.quantity_export > item.quantity) item.quantity_export = item.quantity
    },
    onSubmit() {
      if (this.result) {
        this.$q.notify({
          message: this.$t('product.export_exist_result'),
          color: 'red'
        })
        return null
      }
      this.$refs.form.validate().then(valid => {
        if (valid) {
          this.$q.dialog({
            title: this.$t('message_box.confirm'),
            message: this.$t('product.export_confirm'),
            cancel: true,
            persistent: true
          }).onOk(() => {
            api.exports(this.items).then(x => {
              if (x) {
                if (x.data) this.result = x.data
                this.reset()
              }
            })
          })
        }
      })
    },
    onColumns(value) {
      var index = this.visibleColumns.indexOf(value)
      if (index < 0) this.visibleColumns.push(value)
      else this.visibleColumns.splice(index, 1)
    },
    onPrint() {
    },
    onCreateNew() {
      this.items = []
      this.result = null
      Cookies.remove('export-tmp')
    },
    reset() {
      new Promise((resolve, reject) => {
        Cookies.remove('export-tmp')
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
