import adapter from '../adapters'

export default function({document, model}) {
  return {
    id: adapter.id({
      document,
      model
    }),
    type: adapter.type({model})
  }
}
