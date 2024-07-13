import Model, { transformData, bind } from '@cip/utils/model'
import req from '@cip/request'

class ApiService extends Model {
  @transformData()
  page (searchFilter, { offset = 0, limit = 10 }) {
    return req('get', 'apiSecurity', '/api/v1/discovery/rule/page', { ...searchFilter, offset, limit })
  }

  @transformData()
  create (data) {
    return req('post', 'apiSecurity', '/api/v1/discovery/rule/save', data)
  }

  @transformData()
  info ({ id }) {
    return {}
  }

  @bind
  update (data) {
    return this.create(data)
  }

  @transformData()
  delete ({ id }) {
    return req('delete', 'apiSecurity', `/api/v1/discovery/rule/${id}/del`)
  }

  @transformData()
  batchDelete (data) {
    return req('delete', 'apiSecurity', '/api/v1/discovery/rule/deleteBatch', { ids: data.map(item => item.id) })
  }
}

export const apiService = new ApiService()
