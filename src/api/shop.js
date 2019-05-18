import request from '@/utils/request'

export function fetchOwns() {
  return request({
    url: '/shops/owns',
    method: 'get'
  })
}

export function fetchList(query) {
  return request({
    url: '/shops',
    method: 'get',
    params: query
  })
}
