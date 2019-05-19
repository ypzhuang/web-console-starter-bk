import request from '@/utils/request'

export function fetchFilteredPositions() {
  return request({
    url: '/authorities/filter',
    method: 'get'
  })
}

export function fetchAllPositions() {
  return request({
    url: '/authorities',
    method: 'get'
  })
}
