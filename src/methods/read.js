import {
  normalize,
  include
} from '../params'
import {convert} from '../jsonapi'
import Promise from 'bluebird'

function fetchAll({model, req, res}) {
  const query = normalize({req})
  const documents = model
    .findAll({
      order: query.order,
      limit: query.limit,
      offset: query.offset,
      include: [{ all: true }]
      /*include: include({
        model,
        param: query.include
      })*/
    })
    .then(documents => {
      res
        .status(200)
        .body = convert({
          documents,
          model
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
  return model
    .findOne({
      where: {
        [idField]: req.params[idParam]
      },
      include: [{ all: true }]
      /*include: include({
        model,
        param: query.include
      })*/
    })
    .then(document => {
      res
        .status(200)
        .body = convert({
          documents: document,
          model
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
