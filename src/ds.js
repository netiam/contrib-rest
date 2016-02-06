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

            if (_.isArray(data)) {
              const list = _.map(data, item => item.data)
              included.push(...list)
            } else if (_.isObject(data)) {
              included.push(data.data)
            }

            if (_.isArray(data)) {
              data = _.map(data, item => {
                return {
                  id: item.data.id,
                  type: item.data.type
                }
              })
            } else if (_.isObject(data)) {
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
    )
  }

  if (_.isObject(documents)) {
    return fromDocument({document: documents})
  }

  Promise.reject(
    new Error('"documents" must either be an object or an array of objects')
  )
}
