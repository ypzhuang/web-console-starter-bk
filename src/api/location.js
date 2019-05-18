import request from '@/utils/request'

export function fetchLocations() {
  return request({
    url: '/locations',
    method: 'get'
  })
}

export function fetchCities(provinceCode) {
  return request({
    url: `/locations/${provinceCode}/countries`,
    method: 'get'
  })
}
