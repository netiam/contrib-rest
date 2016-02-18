import _ from 'lodash'
import Promise from 'bluebird'

export const ID_SEPARATOR = '--'
export const PATH_SEPARATOR = '.'
export const VALUE_SEPARATOR = ','

export function idQuery({model, id}) {
  const fields = primaryKeys({model})
  const values = id.split(ID_SEPARATOR)

  if (fields.length !== values.length) {
    throw new Error('The number of ID parameter values does not match the number of ID fields')
  }

  return _.zipObject(fields, values)
}

function primaryKeys({model}) {
  return _.keys(model.primaryKeys)
}

export function idValue({model, document}) {
  const fields = primaryKeys({model})
  const values = _.map(fields, field => document[field])
  return values.join(ID_SEPARATOR)
}

export function type({model}) {
  return _.kebabCase(model.name)
}

function foreignKeys({model}) {
  return _.reject(
    _.map(model.attributes, (attribute, key) => {
      return _.has(attribute, 'references') ? key : undefined
    }),
    _.isEmpty
  )
}

function attributeKeys({model}) {
  const foreign = foreignKeys({model})
  const primary = primaryKeys({model})
  const excludeKeys = primary.concat(foreign)
  return _.without(_.keys(model.attributes), ...excludeKeys)
}

export function attributes({model, document}) {
  const keys = attributeKeys({model})
  return _.pick(document, keys)
}

function relationshipKeys({model}) {
  return _.keys(model.associations)
}

export function relationshipModel({model, relationship}) {
  if (!_.has(model.associations, relationship)) {
    return
  }

  return model.associations[relationship].target
}

export function relationships({model, document}) {
  const relationships = {}
  const keys = relationshipKeys({model})
  _.forEach(keys, key => {
    if (!document[key]) {
      return
    }

    relationships[key] = document[key]
  })
  return relationships
}

export function validateIncludePath({model, path}) {
  const parts = path.split(PATH_SEPARATOR)
  if (parts.length === 0) {
    return false
  }
  const keys = relationshipKeys({model})
  if (parts.length === 1) {
    return _.includes(keys, (parts[0]))
  }

  const relationship = parts.shift()
  const assocModel = relationshipModel({
    model,
    relationship
  })
  if (!assocModel) {
    return false
  }

  return validateIncludePath({
    model: assocModel,
    path: parts.join('.')
  })
}

function include({model, path}) {
  const parts = path.split(PATH_SEPARATOR)
  const part = parts.shift()

  const assocModel = relationshipModel({
    model,
    relationship: part
  })

  if (parts.length === 0) {
    return {
      model: assocModel,
      as: part
    }
  }

  return {
    model: assocModel,
    as: part,
    include: include({
      model: assocModel,
      path: parts.join(PATH_SEPARATOR)
    })
  }
}

export function includeQuery({model, param}) {
  const params = _.filter(param.split(VALUE_SEPARATOR), value => {
    return validateIncludePath({
      model,
      path: value
    })
  })

  if (params.length === 0) {
    return []
  }

  return _.map(params, path => include({
    model,
    path
  }))
}

export function isIncluded({model, path, include = ''}) {
  const params = _.filter(include.split(VALUE_SEPARATOR), value => {
    return validateIncludePath({
      model,
      path: value
    })
  })

  let result = false

  _.forEach(params, value => {
    const includeParts = value.split(PATH_SEPARATOR)
    const pathParts = path.split(PATH_SEPARATOR)
    let match = true
    for (let i = 0; i < pathParts.length; i += 1) {
      if (includeParts[i] !== pathParts[i]) {
        match = false
        break
      }
    }
    if (match) {
      result = match
      return false
    }
  })

  return result
}

export function setRelationship({model, document, path, resourceIdentifiers, transaction}) {
  if (!_.isArray(resourceIdentifiers)) {
    resourceIdentifiers = [resourceIdentifiers]
  }

  const assocModel = relationshipModel({
    model,
    relationship: path
  })

  // TODO support composite primary keys
  const ids = _.map(resourceIdentifiers, resourceIdentifier => resourceIdentifier.id)
  const associationType = model.associations[path].associationType
  return assocModel
    .findAll({
      where: {id: {$in: ids}},
      transaction
    })
    .then(relatedDocuments => {
      switch (associationType) {
        case 'HasOne':
          return document[`set${_.capitalize(path)}`](relatedDocuments.shift(), {transaction})
        case 'HasMany':
          return document[`set${_.capitalize(path)}`](relatedDocuments, {transaction})
        default:
          console.warn('Associations different than "HasOne" and "HasMany" are not supported')
      }
    })
}
