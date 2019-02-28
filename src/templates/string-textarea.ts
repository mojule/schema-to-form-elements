import { JSONSchema4 } from 'json-schema'
import { TemplateFactory } from '../types'

export const StringTextAreaTemplate: TemplateFactory<HTMLTextAreaElement> =
  ( document: Document ) => {
    const stringTextAreaTemplate = ( schema: JSONSchema4 ) => {
      const editor = document.createElement( 'textarea' )

      editor.dataset.title = schema.title || 'Multiline String'

      if ( typeof schema.type === 'string' )
        editor.dataset.type = schema.type

      if ( schema.default )
        editor.defaultValue = String( schema.default )

      if ( schema.minLength !== undefined ) {
        editor.minLength = schema.minLength
      }

      if ( schema.maxLength !== undefined ) {
        editor.maxLength = schema.maxLength
      }

      return editor
    }

    return stringTextAreaTemplate
  }
