import { JSONSchema4 } from 'json-schema'

export const NumberTemplate =
  ( document: Document, isRange = false ) => {
    const numberTemplate = ( schema: JSONSchema4, name = '', defaultValue?: number ) => {
      const editor = document.createElement( 'input' )

      editor.type = isRange ? 'range' : 'number'
      editor.title = schema.title || 'Number'

      if( name ) editor.name = name

      if ( typeof defaultValue === 'number' ) {
        editor.defaultValue = String( defaultValue )
      } else if ( typeof schema.default === 'number' ) {
        editor.defaultValue = String( schema.default )
      }

      if ( typeof schema.multipleOf === 'number' ) {
        editor.step = String( schema.multipleOf )
      } else if ( schema.type === 'integer' ){
        editor.step = '1'
      }

      if ( 'minimum' in schema ) {
        editor.min = String( schema.minimum )
      }

      if ( 'maximum' in schema ) {
        editor.max = String( schema.maximum )
      }

      return editor
    }

    return numberTemplate
  }
