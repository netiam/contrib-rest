import _ from 'lodash'
import {
  normalize
} from '../params'
import {
  include
} from '../adapters/sequelize'
import {convert} from '../jsonapi'
import Promise from 'bluebird'

function fetchAll({model, req, res}) {
  const query = normalize(req.query)
  const originalInclude = query.include
  if (_.isArray(query.include)) {
    query.include = [{all: true}].concat(include(model, query.include))
  } else {
    query.include = [{all: true}]
  }

  // TODO transaction to ensure COUNT matches response?
  return model.sequelize.transaction(() => {
    const documents = model
      .findAll(query)
      .then(documents => {
        res.status(200)
        res.body = convert({
          documents: _.map(documents, document => document.toJSON()),
          model,
          include: originalInclude
        })
      })
    const count = model
      .count({where: query.where})
      .then(count => {
        res.meta = Object.assign({}, res.meta, {count})
      })
    return Promise.all([documents, count])
  })
}

function fetchOne({model, idParam, idField, req, res}) {
  const query = normalize(req.query)
  const originalInclude = query.include
  if (_.isArray(query.include)) {
    query.include = [{all: true}].concat(include(model, query.include))
  } else {
    query.include = [{all: true}]
  }

  // TODO map idField to primaryKeys
  return model
    .findOne(
      _.assign(
        query,
        {where: {[idField]: req.params[idParam]}}
      )
    )
    .then(document => {
      if (!document) {
        // TODO normalize error
        return res
          .status(404)
          .json(new Error('Document not found'))
      }
      res.status(200)
      res.body = convert({
        documents: document.toJSON(),
        model,
        include: originalInclude
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
