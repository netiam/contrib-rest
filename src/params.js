import _ from 'lodash'

export function normalize({req, idField = 'id', limit = 10}) {
  if (!req || !req.query) {
    throw new Error('Either the request object itself or the request.query object does not exist')
  }

  const query = {
    filter: '',
    include: [],
    order: idField,
    limit: limit,
    offset: 0
  }

  // Filter
  if (req.query.filter) {
    query.filter = req.query.filter
  }

  // Embeded documents
  if (_.isString(req.query.include)) {
    query.include = req.query.include.split(',')
  }

  // Order
  if (req.query.order) {
    query.order = req.query.order
  }

  // Pagination
  if (req.query.offset) {
    query.offset = Number(req.query.offset)
  }

  if (req.query.limit) {
    query.limit = Number(req.query.limit)
  }

  if (query.page) {
    query.page = req.query.page ? Number(req.query.page) : 1
    query.offset = Math.max(0, (query.page - 1) * query.limit)
  }

  return query
}

function includeObject({Model, parts, obj = {}}) {
  const path = parts.shift()
  obj.model = Model.modelManager.getModel(path)

  if (parts.length === 0) {
    return obj
  }

  const nestedObject = {}
  obj.include = [nestedObject]

  includeObject({
    Model,
    parts,
    obj: nestedObject
  })

  return obj
}

export function include({Model, param}) {
  if (!_.isArray(param)) {
    throw new Error(`The include parameter ${param} is not an array`)
  }
  if (param.length === 0) {
    return
  }

  return param.map(path => {
    const parts = path.split('.')

    return includeObject({
      Model,
      parts
    })
  })
}
