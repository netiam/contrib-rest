import _ from 'lodash'

export default function({document, model}) {
  const keys = _.keys(model.primaryKeys)
  return _.at(document, keys).join('-')
}
