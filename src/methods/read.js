import {
  normalize,
  include
} from '../params'

function fetchAll({model, req, res}) {
  const query = normalize({req})
  return model
    .findAll({
      order: query.order,
      limit: query.limit,
      offset: query.offset,
      include: include({
        model,
        param: query.include
      })
    })
    .then(documents => {
      res
        .status(200)
        .body = documents.map(document => document.toJSON())
    })
    .then(() => {
      return model.count()
    })
    .then(count => {
      res.meta = Object.assign({}, res.meta, {count})
    })
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
    .then(document => {
      res
        .status(200)
        .body = document.toJSON()
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
