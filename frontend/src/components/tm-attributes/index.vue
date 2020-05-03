<template>
  <div>
    <div class="row">
      <div class="col-12">{{labelTitle}}</div>
    </div>
    <div class="row q-mb-md">
      <div class="col-4">
        <auto-complete v-model.trim="key" :data.sync="keys" :label="labelInputKey" :label-no-data="labelNoData"
          is-no-data @input="$emit('on-filter-key', $event)">
        </auto-complete>
      </div>
      <q-space />
      <div class="col-7">
        <auto-complete v-model.trim="value" :data.sync="values" :label="labelInputValue" :label-no-data="labelNoData"
          is-no-data @input="$emit('on-filter-value', $event)">
          <template v-slot:append>
            <q-btn flat round :color="btnColor" :icon="btnIcon" :size="btnSize" @click.prevent="onAddAttr">
              <q-tooltip v-if="!$q.platform.is.mobile">{{labelBtnAdd}}</q-tooltip>
            </q-btn>
          </template>
        </auto-complete>
      </div>
      <!-- <q-space />
      <div class="col">
        <q-btn flat round :color="btnColor" :icon="btnIcon" :size="btnSize" @click.prevent="onAddAttr">
          <q-tooltip v-if="!$q.platform.is.mobile">{{labelBtnAdd}}</q-tooltip>
        </q-btn>
      </div> -->
    </div>
    <div class="row q-mb-md">
      <div class="col-12 row" v-for="(e,i) in data" :key="i">
        <div class="col-4">{{e.key}}</div>
        <q-space />
        <div class="col-6">{{e.value}}</div>
        <div>
          <!-- <i class="material-icons q-icon notranslate btn-icon">edit</i> -->
          <!-- <i class="material-icons q-icon notranslate btn-icon">cancel</i> -->
          <q-btn flat round :color="btnEditColor" :icon="btnEditIcon" :size="btnSize"
            @click.prevent="onEditAttr(e.key,e.value)">
            <q-tooltip v-if="!$q.platform.is.mobile">{{btnEditLabel}}</q-tooltip>
          </q-btn>
          <q-btn flat round :color="btnDeleteColor" :icon="btnDeleteIcon" :size="btnSize"
            @click.prevent="onRemoveAttr(e.key)">
            <q-tooltip v-if="!$q.platform.is.mobile">{{btnDeleteLabel}}</q-tooltip>
          </q-btn>
        </div>
        <!-- <q-list v-if="data&&data.length" dense bordered separator padding class="rounded-borders">
          <q-item v-for="(e,i) in data" :key="i">
            <q-item-section>{{e.key}}</q-item-section>
            <q-item-section>{{e.value}}</q-item-section>
            <q-item-section side>
              <q-btn flat round color="light-green" icon="edit" size="sm" @click.prevent="onEditAttr(k,v)" />
            </q-item-section>
            <q-item-section side>
              <q-btn flat round color="red" icon="cancel" size="sm" @click.prevent="onRemoveAttr(k)" />
            </q-item-section>
          </q-item>
        </q-list> -->
      </div>
    </div>
  </div>
</template>

<script>
import autoComplete from '@/components/auto-complete'
export default {
  components: { autoComplete },
  props: {
    data: { type: Array, default: () => [] },
    keys: { type: Array, default: () => [] },
    values: { type: Array, default: () => [] },
    // meta: { type: Array, default: () => [] },
    dense: { type: Boolean, default: true },
    btnIcon: { type: String, default: 'add' },
    btnColor: { type: String, default: 'blue' },
    btnSize: { type: String, default: 'sm' },
    btnEditIcon: { type: String, default: 'edit' },
    btnEditColor: { type: String, default: 'light-green' },
    btnEditLabel: { type: String, default: 'Edit' },
    btnDeleteIcon: { type: String, default: 'cancel' },
    btnDeleteColor: { type: String, default: 'red' },
    btnDeleteLabel: { type: String, default: 'Delete' },
    labelTitle: { type: String, default: 'Attributes:' },
    labelBtnAdd: { type: String, default: 'Add' },
    labelInputKey: { type: String, default: 'Key' },
    labelInputValue: { type: String, default: 'Value' },
    labelPlaceholder: { type: String, default: null },
    timeoutWarning: { type: Number, default: 3000 },
    colorWarning: { type: String, default: 'warning' },
    labelWarningContent: { type: String, default: 'The attribute is required Key and Value!' },
    labelConfirmTitle: { type: String, default: 'Warning' },
    labelConfirmContent: { type: String, default: 'Are you sure you want to delete this record?' },
    labelNoData: { type: String, default: 'No data available' }
    // rulesKey: null,
    // rulesValue: null
  },
  data() {
    return {
      key: '',
      value: ''
    }
  },
  // watch: {
  //   key(val) {
  //     console.log(val)
  //   }
  // },
  created() {
    if (!this.data) this.$emit('update:data', [])
  },
  methods: {
    onAddAttr() {
      // console.log('key: ' + this.key, ', value: ' + this.value)
      setTimeout(() => {
        if (!this.key || !this.value) {
          this.$q.notify({
            color: this.colorWarning,
            timeout: this.timeoutWarning,
            message: this.labelWarningContent
          })
          return
        }
        this.data.push({ key: this.key, value: this.value })
        this.key = ''
        this.value = ''
      }, 300)
    },
    onEditAttr(key, val) {
      this.onRemoveAttr(key)
      this.key = key
      this.value = val
    },
    onRemoveAttr(key) {
      const index = this.data.findIndex(x => x.key === key)
      if (index > -1) this.data.splice(index, 1)
      // if (Object.keys(this.form.meta).length < 1) this.form.meta = null
      // this.attr = {}
    }
  }
}
</script>

<style>
.btn-icon {
  cursor: pointer;
}
</style>
