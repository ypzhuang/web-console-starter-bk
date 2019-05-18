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

export function fetchAllShopAdmins() {
  return request({
    url: 'employees/allShopAdmins',
    method: 'get'
  })
}

export function fetchAllManagers() {
  return request({
    url: 'employees/allManagers',
    method: 'get'
  })
}

export function fetchShopUsers() {
  return request({
    url: 'employees/shopUsers',
    method: 'get'
  })
}

