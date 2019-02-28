import { JSONSchema4 } from 'json-schema'
import { TemplateFactory, Templates } from '../../types'
import { ensureDefaultDependencies } from '../ensure-default-dependencies'

export const StringTemplate: TemplateFactory<HTMLInputElement | HTMLTextAreaElement> =
  ( document: Document, dependencies: Partial<Templates> = {} ) => {
    const deps = ensureDefaultDependencies( document, dependencies )

    const stringTemplate = ( schema: JSONSchema4 ) => {
      if( schema.format === 'multiline' && deps.stringTextArea )
        return <HTMLTextAreaElement>deps.stringTextArea( schema )

      const editor = deps.input( schema )

      editor.type = 'text'
      editor.dataset.title = schema.title || 'String'

      if ( typeof schema.type === 'string' )
        editor.dataset.type = schema.type

      if ( schema.default )
        editor.defaultValue = String( schema.default )

      if ( schema.pattern ) {
        editor.pattern = schema.pattern
      }

      if ( schema.minLength !== undefined ) {
        editor.minLength = schema.minLength
      }

      if ( schema.maxLength !== undefined ) {
        editor.maxLength = schema.maxLength
      }

      return editor
    }

    return stringTemplate
  }
