import _ from 'lodash'
import getId from './id'
import getType from './type'
import resourceIdentifier from './resource-identifier'

export default function resource({document, model, included}) {
  const id = getId({
    document,
    model
  })
  const type = getType({model})

  const foreignKeys = _.reject(
    _.map(model.attributes, (attribute, key) => {
      return _.has(attribute, 'references') ? key : undefined
    }),
    _.isEmpty
  )
  const excludeKeys = _.keys(model.primaryKeys).concat(foreignKeys)
  const attributeKeys = _.without(_.keys(model.attributes), ...excludeKeys)
  const attributes = _.pick(document, attributeKeys)
  const relationshipKeys = _.keys(model.associations)

  const relationships = {}
  _.forEach(relationshipKeys, key => {
    const data = document[key]
    const relationshipModel = model.associations[key].target
    if (_.isArray(data)) {
      relationships[key] = {
        data: _.map(data, document => {
          const id = getId({
            document,
            model: relationshipModel
          })
          included[id] = resource({
            document,
            model: relationshipModel,
            included
          })
          return resourceIdentifier({
            document,
            model: relationshipModel
          })
        })
      }
    } else if (_.isObject(data)) {
      const id = getId({
        document: data,
        model: relationshipModel
      })
      included[id] = resource({
        document: data,
        model: relationshipModel,
        included
      })
      relationships[key] = {
        data: resourceIdentifier({
          document: data,
          model: relationshipModel
        })
      }
    }
    // Ignore "empty" relationships
  })

  return {
    id,
    type,
    attributes,
    relationships
  }
}
