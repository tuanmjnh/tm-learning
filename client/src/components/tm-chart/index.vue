<template>
  <canvas ref="chartjs" />
</template>

<script>
import Chart from 'chart.js'
export default {
  props: {
    // type: { type: String, default: 'bar' },
    // data: { type: Object, default: null },
    // options: { type: Array, default: null },
    width: { type: Number, default: 100 },
    height: { type: Number, default: 100 }
  },
  data() {
    return {
      myChart: null
    }
  },
  methods: {
    render({ type, data, options, height }) {
      if (this.myChart) this.myChart.destroy()
      // this.$refs.chartjs.style.height = '50px'
      this.$refs.chartjs.height = height || 100
      // this.chartjs = this.$refs.chartjs
      // const ctx = this.chartjs.getContext('2d')
      // const ctx = document.getElementById('planet-chart')
      this.myChart = new Chart(this.$refs.chartjs, {
        type: type,
        data: data,
        options: options || {
          responsive: true,
          // maintainAspectRatio: false,
          // legend: {
          // labels: {
          //   fontColor: 'white' // set your desired color
          // }
          // },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      })
    },
    destroy() {
      if (this.myChart) this.myChart.destroy()
    }
  }
}
</script>

<style>
</style>
