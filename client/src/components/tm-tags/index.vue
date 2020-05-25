<template>
  <div>
    <div class="row q-mb-md">
      <div class="col-5 self-center">{{labelTitle}}</div>
      <q-space />
      <div class="col-5">
        <q-input v-model.trim="tag" :dense="dense" :label="labelInput" :placeholder="labelPlaceholder" :rules="rules">
          <template v-slot:append>
            <q-btn round dense flat :icon="btnIcon" :color="btnColor" :size="btnSize" @click.prevent="onAddTag">
              <q-tooltip v-if="!$q.platform.is.mobile">{{labelBtnAdd}}</q-tooltip>
            </q-btn>
          </template>
        </q-input>
      </div>
    </div>
    <div class="col-12" v-if="data&&data.length">
      <q-chip v-for="(e,i) in data" :key="i" removable clickable @click="onEditTag(e)" @remove="onRemoveTag(e)"
        :color="tagsColor" :text-color="tagsTextColor">{{e}}</q-chip>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: { type: Array, default: () => [] },
    dense: { type: Boolean, default: true },
    btnIcon: { type: String, default: 'add' },
    btnColor: { type: String, default: 'blue' },
    btnSize: { type: String, default: 'sm' },
    tagsColor: { type: String, default: 'primary' },
    tagsTextColor: { type: String, default: 'white' },
    labelTitle: { type: String, default: 'Tags:' },
    labelBtnAdd: { type: String, default: 'Add' },
    labelInput: { type: String, default: 'Tag' },
    labelPlaceholder: { type: String, default: null },
    timeoutWarning: { type: Number, default: 3000 },
    colorWarning: { type: String, default: 'warning' },
    labelWarningContent: { type: String, default: 'Are you sure you want to delete this record?' },
    labelConfirmTitle: { type: String, default: 'Confirm' },
    labelConfirmContent: { type: String, default: 'Are you sure you want to delete this record?' },
    rules: null
  },
  data() {
    return {
      tag: ''
    }
  },
  created() {
    if (!this.data) this.$emit('update:data', [])
  },
  methods: {
    onAddTag() {
      if (!this.tag) {
        this.$q.notify({
          color: this.colorWarning,
          timeout: this.timeoutWarning,
          message: this.labelWarningContent
        })
        return
      }
      this.data.push(this.tag)
      this.tag = ''
    },
    onEditTag(val) {
      this.tag = val
      this.onRemoveTag(val)
    },
    onRemoveTag(val) {
      this.$q.dialog({
        title: this.labelConfirmTitle,
        message: this.labelConfirmContent,
        cancel: true,
        persistent: true
      }).onOk(() => {
        const i = this.data.indexOf(val)
        if (i > -1) this.data.splice(i, 1)
        if (this.data.length < 1) this.$emit('update:data', null)
      })
    }
  }
}
</script>

<style>
</style>
