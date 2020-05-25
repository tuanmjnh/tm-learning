import http from '@/utils/http-client';
const collection = '/product-imports';

export async function select(params) {
  return http.get(collection, params);
}

export async function finds(params) {
  return http.post(collection, params);
}

export async function imports(params) {
  return http.put(collection, params);
}
