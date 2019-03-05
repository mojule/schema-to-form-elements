import { JSONSchema4 } from 'json-schema'

export const getTitle = ( schema: JSONSchema4, name = '', fallback = 'Schema' ) =>
  schema.title || name || fallback