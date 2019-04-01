import { SchemaTemplate } from '../../types'
import { JSONSchema4 } from 'json-schema'

export const ConstDecorator = (
  _document: Document, stringOrNumberTemplate: SchemaTemplate
) => {
  const constDecorator = (
    schema: JSONSchema4 = {}, name = '', value?: string | number,
    isRequired = false
  ) => {
    if( Array.isArray( schema.enum ) && schema.enum.length === 1 ){
      const editor = stringOrNumberTemplate( schema, name, schema.enum[ 0 ] )
      const input = <HTMLInputElement | null>(
        editor.matches( 'input' ) ? editor :
          editor.querySelector( 'input' )
      )

      if ( !input )
        return editor

      if( schema.format === 'hidden' ){
        input.type = 'hidden'

        return input
      }

      input.readOnly = true

      return input
    }

    return stringOrNumberTemplate( schema, name, value, isRequired )
  }

  return constDecorator
}
