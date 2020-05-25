import { axiosApi, axiosApiDebonce } from '@/utils/http-client';
const collection = '/news';

export async function select(params) {
  return axiosApi.get(collection, { params });
}

export async function getAttr(params) {
  return axiosApiDebonce({
    method: 'get',
    params: params,
    url: `${collection}/get-attr`
  });
}

export async function insert(params) {
  return axiosApi.post(collection, params);
}

export async function update(params) {
  return axiosApi.put(collection, params);
}

export async function lock(params) {
  return axiosApi.patch(collection, params);
}
