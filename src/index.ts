import { JSONSchema4 } from 'json-schema'
import { Templates } from './types'

export const SchemaToFormElements = ( templates: Partial<Templates> ) => {
  const schemaToFormElements = ( schema: JSONSchema4, name = '', value?: any ) => {
    if ( typeof schema.type !== 'string' )
      throw Error( 'Expected type to be a string' )

    if ( !schemaTypeNames.includes( schema.type ) )
      throw Error( `Expected type to be one of ${ schemaTypeNames }` )

    const template = templates[ schema.type ]

    if( !template )
      throw Error( `No template found for ${ schema.type }` )

    return template( schema, name, value )
  }

  return schemaToFormElements
}

const schemaTypeNames = [
  'array', 'boolean', 'number', 'integer', 'object', 'string'
]