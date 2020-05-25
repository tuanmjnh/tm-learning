import http from '@/utils/http-client'
const collection = '/roles'

export async function select(params) {
  return http.get(collection, { params })
}

export async function insert(params) {
  return http.post(collection, params)
}

export async function update(params) {
  return http.put(collection, params)
}

export async function lock(params) {
  return http.patch(collection, params)
}
