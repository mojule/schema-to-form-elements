import { JSONSchema4 } from 'json-schema'
import { Templates } from './types'

export * from './templates/api/array-list'
export * from './templates/decorators/fieldset'
export * from './templates/decorators/format'
export * from './templates/decorators/label'
export * from './templates/decorators/mutable-array-list'
export * from './templates/types/array'
export * from './templates/types/boolean'
export * from './templates/types/number'
export * from './templates/types/object'
export * from './templates/types/string'
export * from './templates/types/array/array-item'
export * from './templates/types/array/array-list'
export * from './templates/types/array/tuple'
export * from './templates/types'
export * from './templates/utils'
export * from './templates'

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