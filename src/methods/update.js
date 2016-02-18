import _ from 'lodash'
import Promise from 'bluebird'

export default function({model, idField, idParam, req, res}) {
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
          defaults: req.body
        })
        .spread((document, created) => {
          if (created) {
            return res
              .status(201)
              .body = document.toJSON()
          }

          return document.update(req.body)
        })
    })
    .then(document => {
      res
        .status(200)
        .body = document
    })
}
