import _ from 'lodash'
import resourceIdentifier from './resource-identifier'
import adapter from '../adapters'

function compound(baseModel, model, document, include, included, path) {
  const id = adapter.id(model, document)
  const isIncluded = adapter.isIncluded(baseModel, path, include)
  if (isIncluded && !_.has(included, id)) {
    included[id] = resource(baseModel, model, document, include, included, path)
  }
  return resourceIdentifier(model, document)
}

export default function resource(baseModel, model, document, include, included, path = '') {
  const id = adapter.id(model, document)
  const type = adapter.type(model)
  const attributes = adapter.attributes(model, document)
  const associations = adapter.relationships(model, document)
  const relationships = _.mapValues(associations, (data, relationship) => {
    const relationshipModel = adapter.getAssociationModel(model, relationship)
    const relationshipPath = path.length > 0 ? path + '.' + relationship : relationship
    if (_.isArray(data)) {
      return {
        data: _.map(data, document => compound(baseModel, relationshipModel, document, include, included, relationshipPath))
      }
    }

    if (_.isObject(data)) {
      return {
        data: compound(baseModel, relationshipModel, data, include, included, relationshipPath)
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

  return resourceObject
}
