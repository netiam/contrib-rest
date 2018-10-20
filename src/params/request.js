import _ from 'lodash'
import queryFilter from 'netiam-filter'

function validateParamValue(str) {
  return _.isString(str) && str.length > 0
}

function commaSeparatedValues(str) {
  return str
    .split(',')
    .map(part => part.trim())
}

export function include(query) {
  if (!query) {
    return []
  }

  const include = query.include
  if (!validateParamValue(include)) {
    return []
  }

  return commaSeparatedValues(include)
}

export function fields(query) {
  if (!query) {
    return []
  }
  const fields = query.fields
  if (!fields || !_.isObject(fields)) {
    return {}
  }

  return _.fromPairs(
    _.map(fields, (val, field) => {
      if (!validateParamValue(val)) {
        return null
      }

      return [field, commaSeparatedValues(val)]
    })
  )
}

const ORDER_ASC = 'ASC'
const ORDER_DSC = 'DESC'

export function sort(query) {
  if (!query) {
    return []
  }
  const sort = query.sort
  if (!validateParamValue(sort)) {
    return []
  }

  return commaSeparatedValues(sort)
    .map(part => {
      if (part[0] === '-') {
        return [part.substring(1), ORDER_DSC]
      }

      return [part, ORDER_ASC]
    })
}

export function page(query) {
  if (!query) {
    return {
      limit: 10,
      offset: 0
    }
  }

  const page = query.page
  if (!page) {
    return {
      limit: 10,
      offset: 0
    }
  }

  if (page.number) {
    const size = Number(page.size) || 10
    const current = Number(page.number)
    return {
      limit: Number(size),
      offset: size * Math.max(0, current - 1)
    }
  }

  if (page.limit && page.offset) {
    return {
      limit: Number(page.limit),
      offset: Number(page.offset)
    }
  }

  if (page.limit) {
    return {limit: Number(page.limit)}
  }

  if (page.offset) {
    return {offset: Number(page.offset)}
  }

  if (page.before || page.after) {
    if (page.before && page.after) {
      return {
        where: {
          id: {
            $lt: String(page.before),
            $gt: String(page.after)
          }
        }
      }
    }
    if (page.before) {
      return {
        where: {
          id: {
            $lt: String(page.before)
          }
        }
      }
    }
    if (page.after) {
      return {
        where: {
          id: {
            $gt: String(page.after)
          }
        }
      }
    }
  }

  return {
    limit: 10,
    offset: 0
  }
}

export function filter(query) {
  return queryFilter(query.filter || '').toObject()
}
