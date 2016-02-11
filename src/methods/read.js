import {
  normalize,
  include
} from '../params'
import {from} from '../ds'
import Promise from 'bluebird'

function fetchAll({model, req, res}) {
  const query = normalize({req})
  const documents = model
    .findAll({
      order: query.order,
      limit: query.limit,
      offset: query.offset,
      include: include({
        model,
        param: query.include
      })
    })
    .then(documents => from({documents}))
    .then(documents => {
      res
        .status(200)
        .body = documents
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
  return model
    .findOne({
      where: {
        [idField]: req.params[idParam]
      },
      include: include({
        model,
        param: query.include
      })
    })
    .then(document => document.toJSONApi())
    .then(document => {
      res
        .status(200)
        .body = document
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
