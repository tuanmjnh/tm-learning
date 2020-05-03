import http from '@/utils/http-client'
const collection = '/auth'

export async function checkToken(params) {
  return http.get(collection, { params })
}

export async function login(params) {
  return http.post(collection, params)
}
