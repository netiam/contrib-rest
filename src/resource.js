import _ from 'lodash'
import Promise from 'bluebird'
import {
  normalize,
  include
} from './params'

export function list({model, req, res}) {
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
    .
    then(documents => {
      res
        .status(200)
        .body = documents.map(document => document.get({plain: true}))
    })
}

export function create({model, req, res}) {
  let body = req.body
  if (_.isObject(body) && !_.isArray(body)) {
    body = [body]
  }
  if (!_.isArray(body)) {
    return Promise.reject(
      new Error('Request body must either be an array of objects or a single object'))
  }
  if (!body.every(_.isObject)) {
    return Promise.reject(
      new Error('Request body must be an array of objects'))
  }

  return model
    .bulkCreate(body)
    .then(documents => {
      if (documents.length === 1) {
        return res
          .status(201)
          .body = documents[0].get({plain: true})
      }

      res
        .status(201)
        .body = documents.map(document => document.get({plain: true}))
    })
}

export function read({model, idParam, idField, req, res}) {
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

export function update({model, idField, idParam, req, res}) {
  const body = req.body
  if (!_.isObject(body)) {
    return Promise.reject(
      new Error('Request body must be an object'))
  }

  return model.sequelize
    .transaction(transaction => {
      return model
        .findOrCreate({
          where: {
            [idField]: req.params[idParam]
          },
          defaults: req.body,
          transaction
        })
        .spread((document, created) => {
          if (created) {
            return res
              .status(201)
              .body = document.toJSON()
          }

          return document.update(req.body, {transaction})
        })
    })
    .then(document => {
      res
        .status(200)
        .body = document
    })
}

export function remove({model, idParam, idField, req, res}) {
  return model.sequelize
    .transaction(transaction => {
      return model
        .findOne({
          where: {
            [idField]: req.params[idParam]
          }
        })
        .then(document => {
          return document.destroy()
        })
        .then(() => {
          res.status(204)
        })
    })
}
