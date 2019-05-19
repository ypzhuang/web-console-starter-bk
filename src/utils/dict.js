import { fetchAllDicts } from '@/api/dict'

const DICT = 'DICT'

export function getDicts() {
  let dicts = localStorage.getItem(DICT)
  if (!dicts) {
    fetchAllDicts().then(response => {
      dicts = response
      setDicts(response)
    })
  }
  return JSON.parse(dicts)
}

export function setDicts(dicts) {
  localStorage.setItem(DICT, JSON.stringify(dicts))
}

export function removeToken() {
  localStorage.removeItem(DICT)
}

export function getCodes(typeCode) {
  const type = getDicts().find(dict => dict.typeCode === typeCode)
  return type.codes || []
}

const map = {}
export function getName(code) {
  let name = map[code]
  if (!name) {
    const codeRecord = getDicts().flatMap(d => d.codes).find(c => c.value === code)
    name = codeRecord && codeRecord.name || code
    map[code] = name
  }
  return name
}
