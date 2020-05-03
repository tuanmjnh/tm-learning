<template>
  <q-card style="width:700px;max-width:80vw">
    <q-toolbar>
      <q-avatar :icon="$route.meta.icon" size="50px" />
      <q-toolbar-title>
        {{ this.item ? $t("global.update") : $t("global.add") }}
        <span class="text-weight-bold">{{ $t("roles.title") }}</span>
      </q-toolbar-title>
      <q-btn flat round dense icon="close" v-close-popup
        :disable="loading_add || loading_drafts ? true : false">
        <q-tooltip v-if="!$q.platform.is.mobile">{{
          $t("global.cancel")
        }}</q-tooltip>
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
        <q-tab name="attributes" :label="$t('global.attributes')" />
      </q-tabs>
      <q-separator />
      <!-- <q-card-section> -->
      <q-tab-panels v-model="tabs" animated>
        <q-tab-panel name="main">
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <!-- <q-input v-model.trim="form.key" :dense="$store.getters.dense.input" v-lowercase :label="$t('global.types')"
                :rules="[v=>!!v||$t('error.required')]" /> -->
              <!-- <q-select v-model="form.key" hide-selected fill-input use-input input-debounce="0" :dense="$store.getters.dense.input"
                :options-dense="$store.getters.dense.input" @new-value="onAddKey" :options="keys" @filter="onFilterKey"
                :hint="$t('types.hit_key')" :label="$t('global.types')" /> -->
              <auto-complete v-model.trim="form.key" :data.sync="keys"
                :placeholder="$t('global.key')" :label="$t('global.types')" is-no-data
                :no-data="$t('table.no_data')" @input="onFilterKey"
                :rules="[v=>!!v||$t('error.required')]" />
            </div>
            <q-space />
            <div class="col-12 col-md-6">
              <q-input v-model.trim="form.code" v-lowercase :dense="$store.getters.dense.input"
                :label="$t('global.code')" :rules="[v=>!!v||$t('error.required')]" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-12 col-md-5">
              <q-input v-model.trim="form.name" :dense="$store.getters.dense.input"
                :label="$t('global.name')" :rules="[v=>!!v||$t('error.required')]" />
            </div>
            <q-space />
            <div class="col-12 col-md-6">
              <q-input v-model.trim="form.desc" autogrow :dense="$store.getters.dense.input"
                :label="$t('global.desc')" />
            </div>
          </div>
          <div class="row q-gutter-xs">
            <div class="col-3">
              <q-input v-model="form.orders" type="number" :dense="$store.getters.dense.input"
                :label="$t('global.order')" :rules="[v=>!!v||$t('error.required')]" />
            </div>
            <q-space v-if="item" />
            <div class="col-5 self-center" v-if="item">
              <q-toggle v-model="form.flag" :true-value="1" :dense="$store.getters.dense.input"
                :label="form.flag ? $t('global.publish') : $t('global.drafts')" />
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="attributes">
          <tm-attributes :data.sync="form.meta" :keys="metaKeys" :values="metaValues"
            :dense="$store.getters.dense.input" :labelTitle="$t('global.attributes') + ':'"
            :labelBtnAdd="$t('global.add')" :labelInputKey="$t('global.key')"
            :labelInputValue="$t('global.value')" btnIcon="add" btnColor="blue"
            :btnEditLabel="$t('global.edit')" :btnDeleteLabel="$t('global.delete')"
            :labelConfirmTitle="$t('message_box.confirm')"
            :labelConfirmContent="$t('message_box.delete')"
            :labelWarningTitle="$t('message_box.warning')"
            :labelWarningContent="$t('error.required')" :labelNoData="$t('table.no_data')"
            @on-filter-key="onFilterMetaKey" @on-filter-value="onFilterMetaValue">
          </tm-attributes>
        </q-tab-panel>
      </q-tab-panels>
      <!-- </q-card-section> -->
    </q-form>
  </q-card>
</template>

<script>
import { axiosApi, axiosApiDebonce } from '@/utils/http-client'
import autoComplete from '@/components/auto-complete'
import tmAttributes from '@/components/tm-attributes'
export default {
  components: { autoComplete, tmAttributes },
  props: {
    dialog: { type: Boolean, default: true },
    item: { type: Object, default: () => { } },
    items: { type: Array, default: () => [] }
  },
  data() {
    return {
      loading: false,
      loading_add: false,
      loading_drafts: false,
      tabs: 'main',
      form: {},
      keys: [],
      metaKeys: [],
      metaValues: [],
      default: {
        key: '',
        code: '',
        name: '',
        desc: '',
        meta: null,
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
  // mounted() {
  //   this.onGetKey()
  // },
  methods: {
    // onGetKey() {
    //   api.getKey().then((x) => {
    //     if (x) this.keys = x
    //   })
    // },
    onAddKey(val, done) {
      if (val.length > 0) {
        if (!this.keys.includes(val)) this.keys.push(val)
        if (done) done(val, 'toggle')
      }
    },
    onFilterKey() {
      this.keys = []
      axiosApiDebonce({ method: 'get', url: 'types/get-key' }).then((x) => {
        if (x) this.keys = x.data
      })
    },
    onFilterMetaKey(val) {
      let data = { key: true }
      if (val) data.filter = val
      this.metaKeys = []
      axiosApiDebonce({ method: 'get', params: data, url: 'types/get-meta' }).then((x) => {
        if (x) this.metaKeys = x.data
      })
    },
    onFilterMetaValue(val) {
      let data = {}
      if (val) data.filter = val
      this.metaValues = []
      axiosApiDebonce({ method: 'get', params: data, url: 'types/get-meta' }).then((x) => {
        if (x) this.metaValues = x.data
      })
    },
    onSubmit(action) {
      // console.log(this.item)
      this.$refs.form.validate().then(valid => {
        if (valid) {
          if (this.item) {
            this.loading_add = true
            axiosApi.put('types', this.form).then((x) => {
              if (x.ok) {
                const index = this.items.indexOf(this.item)
                if (index > -1) this.items.splice(index, 1, this.form)
              }
            }).finally(() => {
              this.loading_add = false
              this.onAddKey(this.form.key)
            })
          } else {
            this.form.flag = action
            if (action) this.loading_add = true
            else this.loading_drafts = true
            axiosApi.post('types', this.form).then((x) => {
              this.items.push(x)
              this.reset()
            }).finally(() => {
              this.loading_add = false
              this.loading_drafts = false
              this.onAddKey(this.form.key)
              this.reset()
            })
          }
        }
      })
    },
    reset() {
      new Promise((resolve, reject) => {
        this.form = { ...this.default }
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
