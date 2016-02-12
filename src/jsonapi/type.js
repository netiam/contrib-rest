import _ from 'lodash'

export default function({model}) {
  return _.kebabCase(model.name)
}
