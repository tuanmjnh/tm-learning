<template>
  <q-btn-dropdown flat :dense="dense" :color="color" :icon="icon" :dropdown-icon="dropdownIcon"
    :loading="loading" :class="[label?'':'q-btn-dropdown-tm']">
    <template v-slot:label>
      {{label}}
      <q-tooltip v-if="isTooltip">{{labelTooltip}}</q-tooltip>
    </template>
    <q-list dense>
      <q-item clickable v-close-popup v-for="(e,i) in types" :key="i" @click="onExport(e)">
        <q-item-section>
          <q-item-label>{{e.title}}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>

  <!-- <q-btn flat round :dense="dense" :color="color" :icon="icon" :loading="loading"
      @click="onDownload">
      <q-tooltip v-if="isTooltip">
        {{lblTooltip}}
      </q-tooltip>
    </q-btn>
  </div> -->
</template>

<script>
import moment from 'moment'
import JSZip from 'jszip'
import XLSX from 'xlsx'
export default {
  props: {
    data: { type: [Array, String], default: null },
    icon: { type: String, default: 'cloud_download' },
    dropdownIcon: { type: String, default: 'arrow_drop_down' },
    color: { type: String, default: 'blue' },
    dense: { type: Boolean, default: false },
    label: { type: String, default: '' },
    labelTooltip: { type: String, default: 'Export' },
    isTooltip: { type: Boolean, default: false },
    filename: { type: String, default: 'export' },
    sheetName: { type: String, default: 'sheet1' },
    appendFix: { type: Boolean, default: false },
    options: { type: Object, default: () => { } },
    types: {
      type: Array,
      default: () => [
        { title: 'Export .xlsx', type: 'xlsx' },
        { title: 'Export .xls', type: 'xls' },
        { title: 'Export .csv', type: 'csv' },
        { title: 'Export .xml', type: 'xml' },
        { title: 'Export .xml.zip', type: 'xml-zip' },
        { title: 'Export .pdf', type: 'pdf' },
        { title: 'Export .sql', type: 'sql' }
      ]
    }
  },
  data() {
    return {
      loading: false
    }
  },
  watch: {
  },
  methods: {
    onExport(item) {
      new Promise((resolve, reject) => {
        this.loading = true
        this.$emit('start', item)
        resolve(true)
      }).then(() => {
        if (item.type === 'xlsx') {
          this.toXlsx(this.data)
        } else if (item.type === 'xls') {
          this.toXls(this.data)
        } else if (item.type === 'xml') {
          this.toXML(this.data)
        } else if (item.type === 'xml-zip') {
          this.toZipXML(this.data)
        }
      }).finally(() => {
        this.$emit('finish', item)
        this.loading = false
      });
    },
    toXlsx() {
      /* this line is only needed if you are not adding a script tag reference */
      // if (typeof XLSX === 'undefined') XLSX = require('xlsx');

      /* make the worksheet */
      var ws = XLSX.utils.json_to_sheet(this.data);

      /* add to workbook */
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, this.sheetName);

      /* generate an XLSX file */
      XLSX.writeFile(wb, this.getFileName(this.filename, 'xlsx', this.appendFix));
    },
    toXls() {
      /* this line is only needed if you are not adding a script tag reference */
      // if (typeof XLSX === 'undefined') XLSX = require('xlsx');

      /* make the worksheet */
      var ws = XLSX.utils.json_to_sheet(this.data);

      /* add to workbook */
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, this.sheetName);

      /* generate an XLSX file */
      XLSX.writeFile(wb, this.getFileName(this.filename, 'xls', this.appendFix));
    },
    toXML(xmlString) {
      if (!xmlString) {
        // console.log('No data available!')
        return
      }
      var BOM = '\uFEFF'
      var blob = new Blob([BOM + xmlString], { type: 'text/xml;charset=utf-8' }) //  'text/xml;charset=utf-8'
      var url = window.webkitURL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', this.getFileName(this.filename, 'xml', this.appendFix))
      link.click()
    },
    toZipXML(xmlString) {
      if (!xmlString) {
        // console.log('No data available!')
        return
      }
      const zip = new JSZip()
      zip.file(`${this.filename}.xml`, xmlString)
      zip.generateAsync({ type: 'blob' })
        .then((blob) => {
          // saveAs(blob, `${this.zipname}.zip`)
          var url = window.webkitURL.createObjectURL(blob)
          const link = document.createElement('a')
          link.setAttribute('href', url)
          link.setAttribute('download', this.getFileName(this.zipname, 'zip', this.appendFix))
          link.click()
        })
        .catch(e => {
          // console.log(e)
        })
    },
    getFileName(filename, ext, fix = false) {
      return `${fix ? `${filename}_${moment().format('YYYYMMDDhhmmss')}` : filename}.${ext}`
    }
  }
}
</script>

<style scoped>
.q-btn-dropdown-tm >>> .q-btn-dropdown__arrow {
  display: none;
}
</style>
