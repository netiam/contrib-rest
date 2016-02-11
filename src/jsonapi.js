import _ from 'lodash'
import Promise from 'bluebird'

export function to({data}) {
}

function getId({document, model}) {
  const keys = _.keys(model.primaryKeys)
  return _.at(document, keys).join('-')
}

function getType({model}) {
  return _.kebabCase(model.name)
}

function resourceIdentifier({document, model}) {
  return {
    id: getId({
      document,
      model
    }),
    type: getType({model})
  }
}

function resource({document, model, included}) {
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
    } else {
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
  })

  return {
    id,
    type,
    attributes,
    relationships
  }
}

function base({data, included}) {
  return {
    data,
    included
  }
}

export function convert({documents, model}) {
  const included = {}

  if (_.isArray(documents)) {
    return base({
        data: _.map(documents, document => resource({
          document,
          model,
          included
        })),
        included: _.values(included)
      }
    )
  }

  if (_.isObject(documents)) {
    return base({
      data: resource({
        document: documents,
        model,
        included
      }),
      included: _.values(included)
    })
  }
}
