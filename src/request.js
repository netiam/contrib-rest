import _ from 'lodash'

const ORDER_ASC = 'ASC'
const ORDER_DSC = 'DSC'

export default function() {

}

function validateParamValue(str) {
  return _.isString(str) && str.length > 0
}

function commaSeparatedValues(str) {
  return str
    .split(',')
    .map(part => part.trim())
}

export function include(str) {
  if (!validateParamValue(str)) {
    return []
  }

  return commaSeparatedValues(str)
}

export function fields(dict) {
  if (!dict || !_.isObject(dict)) {
    return {}
  }

  return _.object(
    _.map(dict, (val, field) => {
      if (!validateParamValue(val)) {
        return null
      }

      return [field, commaSeparatedValues(val)]
    })
  )
}

export function sort(str) {
  if (!validateParamValue(str)) {
    return []
  }

  return commaSeparatedValues(str)
    .map(part => {
      if (part[0] === '-') {
        return {
          field: part.substring(1),
          order: ORDER_DSC
        }
      }

      return {
        field: part,
        order: ORDER_ASC
      }
    })
}

export function page(dict) {
  if (!dict) {
    return {
      limit: 10,
      offset: 0
    }
  }

  if (dict.number) {
    const size = Number(dict.size) || 10
    const current = Number(dict.number)
    return {
      limit: Number(size),
      offset: size * Math.max(0, current - 1)
    }
  }

  if (dict.limit && dict.offset) {
    return {
      limit: Number(dict.limit),
      offset: Number(dict.offset)
    }
  }

  if (dict.limit) {
    return {limit: Number(dict.limit)}
  }

  if (dict.offset) {
    return {offset: Number(dict.offset)}
  }

  if (dict.before && dict.after) {
    return {
      where: {
        $and: [
          {lt: String(dict.before)},
          {gt: String(dict.after)}
        ]
      }
    }
  }

  return {
    limit: 10,
    offset: 0
  }
}

export function filter() {

}
