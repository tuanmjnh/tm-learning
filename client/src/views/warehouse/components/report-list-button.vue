<template>
  <div class="list-btn q-gutter-sm">
    <q-btn-dropdown split :label="$t(`report.date`)" :dense="$store.getters.dense.button"
      :color="selected==='date'?'primary':'blue-grey'" no-caps class="q-btn--square"
      @click="onSelected('date')">
      <q-list>
        <q-item>
          <q-item-section>
            <q-input :value="start_date?$moment(start_date).format($store.getters.format.date):''"
              :dense="$store.getters.dense.input" readonly :label="$t('global.start_date')"
              :hint="`${$t('global.format')}: ${$store.getters.format.date}`">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="startDate" transition-show="scale" transition-hide="scale">
                    <q-date v-model="start_date" today-btn @input="()=>$refs.startDate.hide()" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-input :value="end_date?$moment(end_date).format($store.getters.format.date):''"
              :dense="$store.getters.dense.input" readonly :label="$t('global.end_date')"
              :hint="`${$t('global.format')}: ${$store.getters.format.date}`">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="endDate" transition-show="scale" transition-hide="scale">
                    <q-date v-model="end_date" today-btn @input="()=>$refs.endDate.hide()" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-btn v-close-popup dense no-caps :label="$t('global.get_data')" color="blue"
              class="q-btn--square list-btn" @click="onSubmitDate('date')" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-btn v-for="(e,i) in type_time" :key="i" :dense="$store.getters.dense.button"
      :label="$t(`report.${e}`)" :color="selected===e?'primary':'blue-grey'" no-caps
      class="q-btn--square" @click="onSelected(e)" />
  </div>
</template>

<script>
export default {
  props: {
    selected: { type: String, default: null }
  },
  data() {
    return {
      type_time: ['weekly', 'month', 'quarter', 'year', 'five_year'],
      start_date: null,
      end_date: null
    }
  },
  methods: {
    onSelected(item) {
      this.$emit('update:selected', item)
      this.$emit('on-selected', { type_time: item })
    },
    onSubmitDate(item) {
      this.$emit('update:selected', item)
      this.$emit('on-selected', { type_time: item, start_date: this.start_date, end_date: this.end_date })
    }
  }
}
</script>

<style scoped>
.list-btn >>> .q-btn {
  font-weight: 400;
}
</style>
