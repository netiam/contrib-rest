import getId from './id'
import getType from './type'

export default function({document, model}) {
  return {
    id: getId({
      document,
      model
    }),
    type: getType({model})
  }
}
