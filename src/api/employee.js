import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/employees',
    method: 'get',
    params: query
  })
}

export function deleteEmployee(id) {
  return request({
    url: `/employees/${id}`,
    method: 'delete'
  })
}

export function fetchArticle(id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createEmployee(data) {
  return request({
    url: '/employees',
    method: 'post',
    data
  })
}

export function updateEmployee(data) {
  return request({
    url: `/employees/${data.id}`,
    method: 'put',
    data
  })
}
