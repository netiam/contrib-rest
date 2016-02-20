import adapter from '../adapters'

export default function(model, document) {
  return {
    id: adapter.id(model, document),
    type: adapter.type(model)
  }
}
