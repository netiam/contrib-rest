import _ from 'lodash'
import Promise from 'bluebird'
import validate from '../validator'
import schema from '../validator/schema/update.json'
import {convert} from '../jsonapi'

export default function({model, idField, idParam, req, res}) {
  if (!validate(schema, req.body)) {
    return Promise.reject(
      new Error('Request body must be a valid JSON API object'))
  }
  const data = req.body.data

  return model.sequelize
    .transaction(() => {
      return model
        .findOne({
          where: {[idField]: req.params[idParam]},
          include: [{all: true}]
        })
        .then(document => document.update(data.attributes))
        .then(document => {
          res.status(200)
          res.body = convert({
            documents: document,
            model
          })
        })
    })
}
