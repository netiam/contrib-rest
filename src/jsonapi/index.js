import _ from 'lodash'
import document from './document'
import resource from './resource'

export function to({data}) {
  // TODO just validate, we do expect a valid jsonapi ds here
  return data
}

export function convert({documents, model, include, path = ''}) {
  const included = {}

  if (_.isArray(documents)) {
    return document({
        data: _.map(documents, document => resource({
          document,
          model,
          include,
          path,
          included
        })),
        included: _.values(included)
      }
    )
  }

  if (_.isObject(documents)) {
    return document({
      data: resource({
        document: documents,
        model,
        include,
        path,
        included
      }),
      included: _.values(included)
    })
  }
}
