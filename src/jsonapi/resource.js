import _ from 'lodash'
import getId from './id'
import getType from './type'
import resourceIdentifier from './resource-identifier'

function isIncluded({relationshipPath, include}) {
  return _.filter(include, param => {
      return _.startsWith(param, relationshipPath)
    }).length > 0
}

export default function resource({document, model, include, path, included}) {
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
    const relationshipPath = path.length > 0 ? path + '.' + key : key
    if (_.isArray(data)) {
      relationships[key] = {
        data: _.map(data, document => {
          const id = getId({
            document,
            model: relationshipModel
          })
          if (
            isIncluded({
              relationshipPath,
              include
            })) {
            included[id] = resource({
              document,
              model: relationshipModel,
              included,
              path: relationshipPath
            })
          }
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
      if (isIncluded({
          relationshipPath,
          include
        })) {
        included[id] = resource({
          document: data,
          model: relationshipModel,
          included,
          path: relationshipPath
        })
      }
      relationships[key] = {
        data: resourceIdentifier({
          document: data,
          model: relationshipModel
        })
      }
    }
    // Ignore "empty" relationships
  })

  const res = {
    id,
    type
  }

  if (!_.isEmpty(attributes)) {
    res.attributes = attributes
  }

  if (!_.isEmpty(relationships)) {
    res.relationships = relationships
  }

  return Object.freeze(res)
}
