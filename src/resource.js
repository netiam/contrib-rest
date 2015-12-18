import _ from 'lodash'
import Promise from 'bluebird'
import {
  normalize,
  include
} from './params'

export function list({Model, req, res}) {
  const query = normalize({req})
  return Model
    .findAll({
      order: query.order,
      limit: query.limit,
      offset: query.offset,
      include: include({
        Model,
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

export function create({Model, req, res}) {
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

  return Model
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

export function read({Model, idParam, idField, req, res}) {
  const query = normalize({req})
  return Model
    .findOne({
      where: {
        [idField]: req.params[idParam]
      },
      include: include({
        Model,
        param: query.include
      })
    })
    .then(document => {
      res
        .status(200)
        .body = document.toJSON()
    })
}

export function update({Model, idField, idParam, req, res}) {
  const body = req.body
  if (!_.isObject(body)) {
    return Promise.reject(
      new Error('Request body must be an object'))
  }

  return Model.sequelize
    .transaction(transaction => {
      return Model
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

export function remove({Model, idParam, idField, req, res}) {
  return Model.sequelize
    .transaction(transaction => {
      return Model
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
