import _ from 'lodash'

export function apply(model, scopes, ...args) {
  if (_.isArray(scopes) && scopes.length > 0) {
    scopes = scopes.map(scope => {
      if (scope === 'defaultScope') {
        return scope
      }
      return {method: [scope, ...args]}
    })
    model = model.scope(...scopes)
  }

  return model
}
