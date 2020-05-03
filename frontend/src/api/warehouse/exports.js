import http from '@/utils/http-client';
const collection = '/product-exports';

export async function select(params) {
  return http.get(collection, params);
}

export async function finds(params) {
  return http.post(collection, params);
}

export async function exports(params) {
  return http.put(collection, params);
}
