import _ from 'lodash'
import Promise from 'bluebird'
import validate from '../validator'
import schema from '../validator/schema/update.json'
import {convert} from '../jsonapi'
import adapter from '../adapters'

function updateRelationships(model, document, relationships) {
  const relationshipKeys = _.keys(model.associations)
  relationships = _.pick(relationships, relationshipKeys)
  const queries = []
  _.forEach(relationshipKeys, path => {
    const resourceIdentifiers = _.get(relationships, `${path}.data`, false)
    if (!resourceIdentifiers) {
      return
    }
    queries.push(
      adapter.setRelationship({
        model,
        document,
        path,
        resourceIdentifiers
      })
    )
  })

  return Promise
    .all(queries)
    .then(() => document)
}

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
        .then(document => updateRelationships(model, document, data.relationships))
        // FIXME find a way to avoid double fetch, necessary cause relationship updates are not reflected in toJSON()
        .then(document => document.reload())
        .then(document => {
          res.status(200)
          res.body = convert({
            documents: document.toJSON(),
            model
          })
        })
    })
}
