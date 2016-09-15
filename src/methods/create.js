import _ from 'lodash'
import Promise from 'bluebird'
import {apply as applyScope} from '../scope'
import validate from '../validator'
import schema from '../validator/schema/create.json'
import {
  convert
} from '../jsonapi'
import adapter from '../adapters'

export default function({model, scopes, req, res}) {
  if (!validate(schema, req.body)) {
    return Promise.reject(
      new Error('Request body must be a valid JSON API object'))
  }
  let data = req.body.data
  if (_.isObject(data) && !_.isArray(data)) {
    data = [data]
  }

  const properties = _.map(data, document => adapter.properties(model, document))

  model = applyScope(model, scopes, req, res)

  return model.sequelize
    .transaction(() => {
      return model
        .bulkCreate(properties)
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
                    // TODO as `BelongsTo` and `HasOne` relationships are set directly
                    // TODO w/ attributes now, we should avoid any double `setRelationship`
                    // TODO calls for those kind of associations
                    const associationType = model.associations[path].associationType
                    switch (associationType) {
                      case 'BelongsTo':
                        return Promise.resolve()
                      case 'HasOne':
                      case 'HasMany':
                      case 'BelongsToMany':
                        return adapter.setRelationship({
                          model,
                          document,
                          path,
                          resourceIdentifiers: relationship.data
                        })
                      default:
                        console.warn('Associations different than "HasOne", "BelongsTo", "HasMany" and "BelongsToMany" are not supported')
                    }
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
