import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/employees',
    method: 'get',
    params
  })
}
