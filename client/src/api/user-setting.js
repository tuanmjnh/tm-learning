import http from '@/utils/http-client'
const collection = '/user-setting'

export async function get(params) {
  return http.get(collection, { params })
}

export async function update(params) {
  return http.put(collection, params)
}
