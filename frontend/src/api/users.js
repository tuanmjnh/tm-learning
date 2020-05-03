import http from '@/utils/http-client'
const collection = '/users'

export async function select(params) {
  return http.get(collection, { params })
}

export async function insert(params) {
  return http.post(collection, params)
}

export async function update(params) {
  return http.put(collection, params)
}

export async function changePassword(params) {
  return http.post(`${collection}/change-password`, params)
}

export async function resetPassword(params) {
  return http.post(`${collection}/reset-password`, params)
}

export async function lock(params) {
  return http.patch(collection, params)
}
