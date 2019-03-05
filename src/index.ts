import { FormTemplates } from './templates'
import { JSONSchema4 } from 'json-schema'
import { Templates } from './types'

export const SchemaToFormElements = ( document: Document, templates: Partial<Templates> = {} ) => {
  templates = Object.assign( {}, FormTemplates( document ), templates )

  const schemaToFormElements = ( schema: JSONSchema4, name = '', value?: any ) => {
    if( typeof schema.type !== 'string' )
      throw Error( 'Expected schema.type to be a string' )

    const template = templates[ schema.type ]

    if( !template )
      throw Error( `No template found for ${ schema.type }` )

    return template( schema, name, value )
  }

  return schemaToFormElements
}
