import validator from 'is-my-json-valid'

export default function(schema, data) {
  const validate = validator(schema)
  return validate(data)
}
