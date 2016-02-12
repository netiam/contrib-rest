import {
  normalize,
  include
} from '../params'
import {convert} from '../jsonapi'
import Promise from 'bluebird'

function fetchAll({model, req, res}) {
  const query = normalize({req})
  const includeAttr = [{all: true}].concat(include({
    model,
    param: query.include
  }))
  const documents = model
    .findAll({
      order: query.order,
      limit: query.limit,
      offset: query.offset,
      include: includeAttr
    })
    .then(documents => {
      if (documents.length === 0) {
        return res
          .status(204)
          .send()
      }
      res.status(200)
      res.body = convert({
        documents,
        model,
        include: query.include,
        path: undefined
      })
    })
  const count = model
    .count()
    .then(count => {
      res.meta = Object.assign({}, res.meta, {count})
    })
  return Promise.all([documents, count])
}

function fetchOne({model, idParam, idField, req, res}) {
  const query = normalize({req})
  const includeAttr = [{all: true}].concat(include({
    model,
    param: query.include
  }))
  // TODO map idField to primaryKeys
  return model
    .findOne({
      where: {
        [idField]: req.params[idParam]
      },
      include: includeAttr
    })
    .then(document => {
      if (!document) {
        // TODO normalize error
        return res
          .status(404)
          .json(new Error('Document not found'))
      }
      res.status(200)
      res.body = convert({
        documents: document,
        model,
        include: query.include,
        path: undefined
      })
    })
}

export default function({model, idParam, idField, req, res}) {
  if (idParam && idField) {
    return fetchOne({
      model,
      idParam,
      idField,
      req,
      res
    })
  }

  return fetchAll({
    model,
    req,
    res
  })
}
