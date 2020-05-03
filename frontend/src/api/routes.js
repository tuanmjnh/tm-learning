import http from '@/utils/http-client';
const collection = '/routes';

export function select(params) {
  return http.get(collection, { params });
}

export async function getMeta(params) {
  return http.axiosApiDebonce({
    method: 'get',
    params: params,
    url: `${collection}/get-meta`
  });
}

export async function insert(params) {
  return http.post(collection, params);
}

export async function update(params) {
  return http.put(collection, params);
}

export async function updateOrder(params) {
  return http.put(`${collection}/update-order`, params);
}

export async function lock(params) {
  return http.patch(collection, params);
}
