import { JSONSchema4 } from 'json-schema'
import { TemplateFactory, Templates } from '../../types'
import { ensureDefaultDependencies } from '../ensure-default-dependencies'

export const NumberTemplate: TemplateFactory<HTMLInputElement> =
  ( document: Document, dependencies: Partial<Templates> = {} ) => {
    const deps = ensureDefaultDependencies( document, dependencies )

    const numberTemplate = ( schema: JSONSchema4 ) => {
      const editor = deps.input( schema )

      editor.type = 'number'
      editor.dataset.title = schema.title || 'Number'

      if ( schema.default )
        editor.defaultValue = String( schema.default )

      if ( schema.type === 'integer' ) {
        editor.step = String( schema.multipleOf || 1 )
      } else if ( schema.multipleOf ) {
        editor.step = String( schema.multipleOf )
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
