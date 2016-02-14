import _ from 'lodash'
import getId from './id'
import getType from './type'
import resourceIdentifier from './resource-identifier'
import adapter from '../adapters'

// TODO 1.1 We do have to load complete information about relationships if they are included including there relationships (root -> association -> relationships)
// TODO 1.2 Refactor loading process in order to exactly know which resources must be loaded (include) and therefore fetch their resource too

function compound({model, relationshipModel, relationshipPath, include, included, document}) {
  const id = adapter.id({
    model: relationshipModel,
    document
  })
  if (adapter.isIncluded({
      model,
      path: relationshipPath,
      include
    }) && !_.has(included, id)) {
    included[id] = resource({
      model: relationshipModel,
      document
    })
  }
  return resourceIdentifier({
    model: relationshipModel,
    document
  })
}

export default function resource({document, model, include, path, included}) {
  const id = adapter.id({
    document,
    model
  })
  const type = adapter.type({model})
  const attributes = adapter.attributes({
    model,
    document
  })
  const associations = adapter.relationships({
    model,
    document
  })
  const relationships = _.mapValues(associations, (data, relationship) => {
    const relationshipPath = path.length > 0 ? path + '.' + relationship : relationship
    const relationshipModel = adapter.relationshipModel({
      model,
      relationship
    })

    if (_.isArray(data)) {
      return {
        data: _.map(data, document => compound({
          model,
          relationshipModel,
          relationshipPath,
          include,
          included,
          document,
        }))
      }
    }

    if (_.isObject(data)) {
      return {
        data: compound({
          model,
          relationshipModel,
          relationshipPath,
          include,
          included,
          document: data
        })
      }
    }
  })

  const resourceObject = {
    id,
    type
  }

  if (!_.isEmpty(attributes)) {
    resourceObject.attributes = attributes
  }

  if (!_.isEmpty(relationships)) {
    resourceObject.relationships = relationships
  }

  return Object.freeze(resourceObject)
}
