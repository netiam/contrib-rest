import _ from 'lodash'
import {
  fields,
  filter,
  include,
  sort,
  page,
} from './params/request'

export function normalize(query) {
  if (!query) {
    throw new Error('The query object does not exist')
  }

  const q = {
    limit: 10,
    offset: 0
  }

  // Fields
  //q.fields = fields(query)

  // Filter
  q.where = filter(query)

  // Include
  q.include = include(query)

  // Pagination
  _.assign(q, page(query))

  // Order
  q.order = sort(query)

  return _.pickBy(q, val => {
    if (_.isNumber(val)) {
      return true
    }

    if (_.isBoolean(val)) {
      return true
    }

    if (!_.isEmpty(val)) {
      return true
    }
  })
}
