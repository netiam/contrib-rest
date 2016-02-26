import _ from 'lodash'
import Promise from 'bluebird'
import validate from '../validator'
import schema from '../validator/schema/create.json'
import {
  convert
} from '../jsonapi'
import adapter from '../adapters'

export default function({model, req, res}) {
  if (!validate(schema, req.body)) {
    return Promise.reject(
      new Error('Request body must be a valid JSON API object'))
  }
  let data = req.body.data
  if (_.isObject(data) && !_.isArray(data)) {
    data = [data]
  }

  const attributes = _.map(data, document => document.attributes)

  return model.sequelize
    .transaction(() => {
      return model
        .bulkCreate(attributes)
        // FIXME: workaround for http://docs.sequelizejs.com/en/latest/api/model/#bulkcreaterecords-options-promisearrayinstance
        .then(documents => {
          return Promise
            .all(
              _.map(documents, (document, index) => {
                const post = data[index]
                if (!_.has(post, 'relationships')) {
                  return Promise.resolve()
                }

                return Promise.all(
                  _.map(post.relationships, (relationship, path) => {
                    return adapter.setRelationship({
                      model,
                      document,
                      path,
                      resourceIdentifiers: relationship.data
                    })
                  })
                )
              })
            )
            // TODO do we really need to fetch all created instances?
            .then(() => {
              return model.findAll({
                where: {id: {$in: _.map(documents, document => document.id)}},
                include: [{all: true}]
              })
            })
            .then(documents => {
              documents = _.map(documents, document => document.toJSON())

              if (documents.length === 1) {
                documents = documents.shift()
              }

              res.status(201)
              res.body = convert({
                documents,
                model
              })
            })
        })
    })
}
