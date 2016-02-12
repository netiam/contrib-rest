import _ from 'lodash'
import base from './jsonapi/document'
import resource from './jsonapi/resource'
import getId from './jsonapi/id'
import getType from './jsonapi/type'

export function to({data}) {
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
