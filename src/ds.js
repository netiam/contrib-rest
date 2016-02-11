import _ from 'lodash'
import Promise from 'bluebird'

export function to({data}) {

}

function getId({document}) {
  const keys = _.keys(document.Model.primaryKeys)
  return _.at(document, keys).join('-')
}

function getType({document}) {
  return _.kebabCase(document.Model.name)
}

function fromDocument({document}) {
  const id = getId({document})
  const type = getType({document})

  const foreignKeys = _.reject(
    _.map(document.Model.attributes, (attribute, key) => {
      return _.has(attribute, 'references') ? key : undefined
    }),
    _.isEmpty
  )
  const excludeKeys = _.keys(document.Model.primaryKeys).concat(foreignKeys)
  const attributeKeys = _.without(Object.keys(document.Model.attributes), ...excludeKeys)
  const attributes = _.pick(document, attributeKeys)

  const included = []

  // TODO do not fetch all relationships, should be one outer join
  const relationshipKeys = Object.keys(document.Model.associations)
  return Promise
    .all(
      _.map(relationshipKeys, key => {
        return document[`get${_.capitalize(key)}`]()
          .then(data => (data ? from({documents: data}) : undefined))
          .then(data => {
            if (!data) {
              return
            }

            if (_.isArray(data.data)) {
              included.push(...data.data)
            } else if (_.isObject(data.data)) {
              included.push(data.data)
            } else {
              throw new Error('"data" has invalid type. Must be of type "Array" or "Object"')
            }

            if (_.isArray(data.data)) {
              data = _.map(data.data, item => {
                return {
                  id: item.id,
                  type: item.type
                }
              })
            } else if (_.isObject(data.data)) {
              data = {
                id: data.data.id,
                type: data.data.type
              }
            }

            return [key, {data}]
          })
      })
    )
    .then(relationships => {
      if (!relationships) {
        return
      }

      relationships = _.fromPairs(
        _.reject(relationships, _.isEmpty)
      )

      const data = {
        id,
        type
      }

      if (!_.isEmpty(attributes)) {
        data.attributes = attributes
      }

      if (!_.isEmpty(relationships)) {
        data.relationships = relationships
      }
      return {
        data: Object.freeze(data),
        included
      }
    })
}

/**
 * Takes data from ORM and transforms into structured data
 *
 * @param {object|array} documents
 * @returns {Promise<object|array>}
 */
export function from({documents}) {
  if (_.isArray(documents)) {
    return Promise.all(
      _.map(documents, document => fromDocument({document}))
    ).then(documents => {
      return {
        data: _.map(documents, document => document.data),
        included: _.reduce(documents, (included, document) => {
          return included.concat(document.included)
        }, [])
      }
    })
  }

  if (_.isObject(documents)) {
    return fromDocument({document: documents})
  }

  Promise.reject(
    new Error('"documents" must either be an object or an array of objects')
  )
}
