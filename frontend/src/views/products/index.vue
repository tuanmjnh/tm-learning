<template>
  <div>
    <q-table :data="items" :columns="columns" row-key="_id" flat :visible-columns="visibleColumns"
      :loading="$store.state.loading.get || $store.state.loading.patch" :selected.sync="selected"
      :dense="$store.getters.dense.table" selection="multiple" :no-data-label="$t('table.no_data')"
      :no-results-label="$t('table.no_filter_data')" :rows-per-page-label="$t('table.row_per_page')"
      :selected-rows-label="()=>`${selected.length} ${$t('table.row_selected')}`"
      :rows-per-page-options="[10, 20, 50, 100, 200, 0]" :pagination.sync="pagination"
      @request="onSelect" :filter="pagination.filter" binary-state-sort>
      <template v-slot:top="props">
        <div class="col-12 row">
          <div class="col-xs-12 col-sm-auto q-table__title text-h6">
            {{ $t("product.title") }}
          </div>
          <q-space />
          <div class="col-xs-12 col-sm-auto self-center text-right">
            <div class="col-auto self-center">
              <q-btn v-if="isRoutes.add" flat round dense icon="add" color="blue"
                @click="dialogAdd = true">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("global.add")}}
                </q-tooltip>
              </q-btn>
              <q-btn v-if="isRoutes.trash && selected.length > 0 && pagination.flag" flat round
                dense color="negative" icon="delete" @click="onTrash()">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("global.delete")}}
                </q-tooltip>
              </q-btn>
              <q-btn v-if="isRoutes.trash && selected.length > 0 && !pagination.flag" flat round
                dense color="warning" icon="restore_page" @click="onTrash()">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("global.recover")}}</q-tooltip>
              </q-btn>
              <q-btn flat round dense :color="$store.getters.darkMode ? '' : 'grey-7'"
                icon="menu_open">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{$t("table.display_columns")}}
                </q-tooltip>
                <q-menu fit>
                  <q-list dense style="min-width:120px">
                    <template v-for="(item, index) in columns">
                      <q-item clickable :key="index" v-if="!item.required"
                        @click="onColumns(item.name)" :active="
                          visibleColumns.indexOf(item.name) > -1 || false
                        ">
                        <q-item-section>{{ $t(item.label) }}</q-item-section>
                      </q-item>
                    </template>
                  </q-list>
                </q-menu>
              </q-btn>
              <q-btn flat round dense :color="$store.getters.darkMode ? '' : 'grey-7'"
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen">
                <q-tooltip v-if="!$q.platform.is.mobile">
                  {{props.inFullscreen? $t("table.normal_screen"): $t("table.full_screen")}}
                </q-tooltip>
              </q-btn>
              <q-btn v-if="isRoutes.trash" flat round dense
                :color="$store.getters.darkMode ? '' : 'grey-7'" icon="more_vert">
                <q-tooltip v-if="!$q.platform.is.mobile">{{
                  $t("table.action")
                }}</q-tooltip>
                <q-menu auto-close>
                  <q-list dense bordered>
                    <q-item clickable>
                      <q-item-section no-wrap @click="onChangeFlag(1)">{{
                        $t("global.working")
                      }}</q-item-section>
                    </q-item>
                    <q-item clickable>
                      <q-item-section no-wrap @click="onChangeFlag(0)">{{
                        $t("global.locked")
                      }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </div>
        <div class="col-12 row">
          <div class="col-xs-12 col-sm-5 col-md-4">
            <select-category :categories="categories" :selected.sync="pagination.categories"
              data-key="_id" data-all :dense="$store.getters.dense.input"
              :labelTitle="$t('category.title_product')" :labelSelect="$t('category.select')"
              :labelAll="$t('category.select_all')" :labelClose="$t('global.cancel')"
              @on-selected="onSelectCategory" />
          </div>
          <q-space />
          <div class="col-xs-12 col-sm-6">
            <q-input v-model="pagination.filter" :dense="$store.getters.dense.input" debounce="500"
              :placeholder="$t('global.search')">
              <template v-slot:append>
                <q-icon v-if="pagination.filter === ''" name="search" />
                <q-icon v-else name="clear" class="cursor-pointer"
                  @click="pagination.filter = ''" />
              </template>
            </q-input>
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
            <span v-if="$store.getters.darkMode" class="text-bold">{{
              $t(col.label)
            }}</span>
            <span v-else class="text-bold text-blue-grey-10">{{
              $t(col.label)
            }}</span>
          </q-th>
          <q-th v-if="isRoutes.edit || isRoutes.trash" auto-width>#</q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-checkbox v-model="props.selected" color="primary"
              :dense="$store.getters.dense.table" />
          </q-td>
          <q-td key="title" :props="props">
            {{ props.row.title }}
          </q-td>
          <q-td key="code" :props="props">
            {{ props.row.code }}
          </q-td>
          <q-td key="quantity" :props="props">
            <span class="q-pr-xs">{{
              props.row.quantity | NumberFormat($store.getters.language)
            }}</span>
            <q-badge v-html="props.row.unit" color="orange" transparent />
          </q-td>
          <q-td key="price" :props="props">
            <span class="q-pr-xs">{{
              props.row.price | NumberFormat($store.getters.language)
            }}</span>
            <q-badge v-html="props.row.price_unit" color="blue" transparent />
          </q-td>
          <q-td key="price_discount" :props="props">
            <span class="q-pr-xs">{{
              props.row.price_discount | NumberFormat($store.getters.language)
            }}</span>
            <q-badge v-html="props.row.price_unit" color="red" transparent />
          </q-td>
          <q-td key="price_import" :props="props">
            <span class="q-pr-xs">{{
              props.row.price_import | NumberFormat($store.getters.language)
            }}</span>
            <q-badge v-html="props.row.price_unit" color="teal" transparent />
          </q-td>
          <q-td key="price_export" :props="props">
            <span class="q-pr-xs">{{
              props.row.price_export | NumberFormat($store.getters.language)
            }}</span>
            <q-badge v-html="props.row.price_unit" color="teal" transparent />
          </q-td>
          <q-td key="order" :props="props">
            {{ props.row.order }}
          </q-td>
          <!-- <q-td key="roles" :props="props" class="q-gutter-xs">
            <template v-if="props.row.roles&&props.row.roles.length>0">
              <q-badge v-for="(item,index) in onFilterRoles(props.row.roles)" :key="index"
                :style="{backgroundColor:item.color}">
                {{item.label}}
              </q-badge>
            </template>
            <q-badge v-else color="blue-grey-10">{{$t('global.undefined')}}</q-badge>
          </q-td> -->
          <q-td v-if="isRoutes.edit || isRoutes.trash" auto-width class="text-center">
            <q-btn v-if="isRoutes.edit" flat round dense icon="edit" color="light-green"
              :size="$store.getters.dense.table ? 'sm' : 'md'" @click="onUpdate(props.row)">
              <q-tooltip v-if="!$q.platform.is.mobile">
                {{ $t("global.update") }}</q-tooltip>
            </q-btn>
            <template v-if="isRoutes.trash">
              <q-btn v-if="pagination.flag" flat round dense color="negative" icon="clear"
                :size="$store.getters.dense.table ? 'sm' : 'md'" @click="onTrash(props.row)">
                <q-tooltip v-if="!$q.platform.is.mobile">{{
                  $t("global.lock")
                }}</q-tooltip>
              </q-btn>
              <q-btn v-else flat round dense color="amber" icon="restore"
                :size="$store.getters.dense.table ? 'sm' : 'md'" @click="onTrash(props.row)">
                <q-tooltip v-if="!$q.platform.is.mobile">{{
                  $t("global.unlock")
                }}</q-tooltip>
              </q-btn>
            </template>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <!-- Add dialog -->
    <q-dialog v-model="dialogAdd" persistent>
      <template-add :dialog.sync="dialogAdd" :item.sync="selected[0]" :items.sync="items"
        :categories="categories" :units="units" :unitsPrice="unitsPrice" :pins="pins" />
    </q-dialog>
  </div>
</template>

<script>
import templateAdd from './add'
import selectCategory from '@/views/category/components/select-category'
import * as api from '@/api/products'
import * as apiCategories from '@/api/categories'
import * as apiTypes from '@/api/types'
export default {
  components: { templateAdd, selectCategory },
  data() {
    return {
      dialogAdd: false,
      items: [],
      selected: [],
      categories: [],
      units: [],
      unitsPrice: [],
      pins: [],
      isRoutes: {
        add: this.$router.has('products-add'),
        edit: this.$router.has('products-edit'),
        trash: this.$router.has('products-trash')
      },
      pagination: {
        filter: '',
        sortBy: 'order',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 1,
        categories: null,
        flag: 1
      },
      visibleColumns: ['price', 'price_discount'],
      columns: [
        { name: 'title', field: 'title', label: 'product.name', align: 'left', sortable: true, required: true }, // row => this.$t(`roles.${row.name}`)
        { name: 'code', field: 'code', label: 'product.code', align: 'left', sortable: true, required: true },
        { name: 'quantity', field: 'quantity', label: 'product.quantity_store', align: 'right', sortable: true, required: true },
        { name: 'price', field: 'price', label: 'product.price_sale', align: 'right', sortable: true },
        { name: 'price_discount', field: 'price_discount', label: 'product.price_discount', align: 'right', sortable: true },
        { name: 'price_import', field: 'price_import', label: 'product.price_import', align: 'right', sortable: true },
        { name: 'price_export', field: 'price_export', label: 'product.price_export', align: 'right', sortable: true },
        { name: 'order', field: 'order', label: 'global.order', align: 'right', sortable: true }
      ]
    }
  },
  created() {
    this.onGetCategory()
    this.onGetUnits({ key: 'unit' })
    this.onGetUnitsPrice({ key: 'unit_price' })
    this.onGetPins({ key: 'pin_product' })
    this.onSelect({ pagination: this.pagination })
  },
  watch: {
    dialogAdd(val) {
      if (!val) this.selected = []
    }
  },
  methods: {
    onGetCategory(params) {
      apiCategories.select(params).then((x) => {
        this.categories = x.data
        // const all = {
        //   _id: null,
        //   dependent: null,
        //   icon: 'graphic_eq',
        //   color: '#3f51b5',
        //   flag: 1,
        //   title: this.$t('category.select_all')
        // }
        // this.categories = [...[all], ...x.data]
      })
    },
    onSelectCategory(value) {
      if (value) {
        // this.pagination.categories = value._id
        this.onSelect({ pagination: this.pagination })
      }
    },
    onGetUnits(props) {
      apiTypes.select(props).then((x) => {
        if (x && x.data && x.data.length > 0) this.units = x.data
      })
    },
    onGetUnitsPrice(props) {
      apiTypes.select(props).then((x) => {
        if (x && x.data && x.data.length > 0) this.unitsPrice = x.data
      })
    },
    onGetPins(props) {
      apiTypes.select(props).then((x) => {
        if (x && x.data && x.data.length > 0) this.pins = x.data.map(x => ({ value: x.code, label: x.name }))
      })
    },
    onSelect(props) {
      api.select(props.pagination).then((x) => {
        this.items = x.data
        this.pagination = props.pagination
        this.pagination.rowsNumber = x.rowsNumber
      })
    },
    onChangeFlag(flag) {
      if (flag === this.pagination.flag) return
      this.selected = []
      this.pagination.flag = flag
      this.onSelect({ pagination: this.pagination })
    },
    onColumns(value) {
      var index = this.visibleColumns.indexOf(value)
      if (index < 0) this.visibleColumns.push(value)
      else this.visibleColumns.splice(index, 1)
    },
    onUpdate(item) {
      this.dialogAdd = true
      this.selected = [item]
    },
    onTrash(item) {
      this.$q.dialog({
        title: this.$t('message_box.warning'),
        message: this.pagination.flag ? this.$t('message_box.lock') : this.$t('message_box.unlock'),
        cancel: true,
        persistent: true
      }).onOk(() => {
        if (item) this.selected = [item]
        api.lock({ _id: this.selected.map(x => x._id) }).then((x) => {
          x.success.forEach(e => {
            const index = this.items.findIndex(x => x._id === e)
            this.items.splice(index, 1)
          })
        }).finally(() => {
          this.selected = []
        })
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        this.selected = []
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }
  }
}
</script>

<style>
</style>
