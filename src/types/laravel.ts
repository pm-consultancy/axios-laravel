interface DataResponse<T = any> {
  data: T
}

interface DataArrayResponse<T = any> {
  data: T[]
}

interface PaginatedResponse<T = any> {
  data: T[]
  meta: Meta
}

interface MetaLinks {
  url?: string
  label?: string
  active?: boolean
}

interface Meta {
  currentPage?: number | null
  from?: number | null
  lastPage?: number | null
  perPage?: number | null
  to?: number | null
  total?: number | null
  path?: string | null
  links?: MetaLinks[]
}

interface Links {
  first?: string | null
  last?: string | null
  prev?: string | null
  next?: string | null
}


export type {
  Links,
  Meta,
  DataResponse,
  DataArrayResponse,
  PaginatedResponse,
  MetaLinks
};
