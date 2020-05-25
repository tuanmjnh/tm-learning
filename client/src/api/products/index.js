import { axiosApi, axiosApiDebonce } from '@/utils/http-client';
const collection = '/products';

export async function select(params) {
  return axiosApi.get(collection, { params });
}

export async function find(params) {
  return axiosApi.get(`${collection}/find`, { params });
}

export async function exist(params) {
  return axiosApi.get(`${collection}/exist`, { params });
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

export async function loadFileImport(params) {
  return axiosApi.post(`${collection}/load-file-import`, params);
}

export async function finds(params) {
  return axiosApi.post(`${collection}/finds`, params);
}

export async function imports(params) {
  return axiosApi.post(`${collection}/imports`, params);
}
