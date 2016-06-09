import _ from 'lodash'
import Promise from 'bluebird'
import util from 'util'

export const ID_SEPARATOR = '--'
export const PATH_SEPARATOR = '.'
export const VALUE_SEPARATOR = ','

export function idQuery(model, id) {
  const fields = primaryKeys(model)
  const values = id.split(ID_SEPARATOR)

  if (fields.length !== values.length) {
    throw new Error('The number of ID parameter values does not match the number of ID fields')
  }

  return _.zipObject(fields, values)
}

export function properties(model, document) {
  const attributes = document.attributes
  const relationshipData = relationships(model, document.relationships)
  _.forEach(relationshipData, (relationship, path) => {
    const association = model.associations[path]
    const associationType = association.associationType
    switch (associationType) {
      case 'BelongsTo':
        attributes[association.foreignKey] = relationship.data.id
        return
      case 'HasOne':
      case 'HasMany':
      case 'BelongsToMany':
        return
      default:
        console.warn('Associations different than "HasOne", "BelongsTo", "HasMany" and "BelongsToMany" are not supported')
    }
  })
  return attributes
}

function primaryKeys(model) {
  return _.keys(model.primaryKeys)
}

export function id(model, document) {
  const fields = primaryKeys(model)
  const values = _.map(fields, field => document[field])
  return values.join(ID_SEPARATOR)
}

export function type(model) {
  return _.kebabCase(model.name)
}

function foreignKeys(model) {
  return _.reject(
    _.map(model.attributes, (attribute, key) => {
      return _.has(attribute, 'references') ? key : undefined
    }),
    _.isEmpty
  )
}

function attributeKeys(model) {
  const foreign = foreignKeys(model)
  const primary = primaryKeys(model)
  const excludeKeys = primary.concat(foreign)
  return _.without(_.keys(model.attributes), ...excludeKeys)
}

export function attributes(model, document) {
  const keys = attributeKeys(model)
  return _.pick(document, keys)
}

function relationshipKeys(model) {
  return _.keys(model.associations)
}

export function relationships(model, relationshipsMap) {
  const relationships = {}
  const keys = relationshipKeys(model)
  _.forEach(keys, key => {
    if (_.has(relationshipsMap, key)) {
      relationships[key] = relationshipsMap[key]
    }
  })
  return relationships
}

export function hasAssociation(model, path) {
  if (path.length === 0) {
    return false
  }

  const parts = path.split(PATH_SEPARATOR)
  let result = true
  let part

  while (parts.length > 0) {
    part = parts.shift()
    const target = `associations.${part}.target`
    if (!_.has(model, target)) {
      result = false
      break
    }
    model = _.get(model, target)
  }
  return result
}

export function getAssociationModel(model, path) {
  const parts = path.split(PATH_SEPARATOR)
  let part
  while (part = parts.shift()) {
    const target = `associations.${part}.target`
    if (!_.has(model, target)) {
      throw new Error('Association does not exist')
    }
    model = _.get(model, target)
  }

  return model
}

export function isIncluded(model, path, include) {
  const params = _.filter(include, value => {
    return hasAssociation(model, value)
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

export function includePath(model, path) {
  const parts = path.split(PATH_SEPARATOR)
  const part = parts.shift()

  const associationModel = getAssociationModel(model, part)

  if (parts.length === 0) {
    return {
      model: associationModel,
      as: part
    }
  }

  return {
    model: associationModel,
    as: part,
    include: [includePath(associationModel, parts.join(PATH_SEPARATOR))]
  }
}

function merge(paths, include) {
  return paths.reduce((include, path) => {
    const exists = include.find(element => element.model === path.model && element.as === path.as)
    if (!exists) {
      include.push(path)
      return include
    }

    if (!_.isArray(exists.include)) {
      exists.include = []
    }
    if (_.isArray(path.include)) {
      exists.include.push(...path.include)
    }

    exists.include = merge(exists.include, [])

    return include
  }, include)
}

export function include(model, include) {
  if (!_.isArray(include)) {
    throw new Error('"include" must be an array')
  }

  include = _.filter(include, value => {
    return hasAssociation(model, value)
  })

  const paths = include.map(path => includePath(model, path))
  return merge(paths, [])
}

export function setRelationship({model, document, path, resourceIdentifiers, transaction}) {
  if (!_.isArray(resourceIdentifiers)) {
    resourceIdentifiers = [resourceIdentifiers]
  }

  const associationModel = getAssociationModel(model, path)

  // TODO support composite primary keys
  const ids = _.map(resourceIdentifiers, resourceIdentifier => resourceIdentifier.id)
  const associationType = model.associations[path].associationType
  return associationModel
    .findAll({
      where: {id: {$in: ids}},
      transaction
    })
    .then(relatedDocuments => {
      // TODO sequelize docs say we should be able todo sth like this document.set('projects', documents), but it did not work?
      switch (associationType) {
        case 'HasOne':
        case 'BelongsTo':
          return document[`set${_.capitalize(path)}`](relatedDocuments.shift(), {transaction})
        case 'HasMany':
        case 'BelongsToMany':
          return document[`set${_.capitalize(path)}`](relatedDocuments, {transaction})
        default:
          console.warn('Associations different than "HasOne", "BelongsTo", "HasMany" and "BelongsToMany" are not supported')
      }
    })
}
