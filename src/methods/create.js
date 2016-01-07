import _ from 'lodash'
import Promise from 'bluebird'

export default function({model, req, res}) {
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
