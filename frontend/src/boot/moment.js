import moment from 'moment'

export default async ({ Vue }) => {
  // moment.defaultFormat = 'YYYY/MM/DD'
  Vue.prototype.$moment = moment
}
