import { JSONSchema4 } from 'json-schema'
import { TemplateFactory, Templates } from '../../types'
import { ensureDefaultDependencies } from '../ensure-default-dependencies';

export const BooleanTemplate: TemplateFactory<HTMLInputElement> =
  ( document: Document, dependencies: Partial<Templates> = {} ) => {
    const deps = ensureDefaultDependencies( document, dependencies )

    const booleanTemplate = ( schema: JSONSchema4 ) => {
      const editor = deps.input( schema )

      editor.type = 'checkbox'
      editor.dataset.title = schema.title || 'Boolean'

      if ( schema.default )
        editor.checked = true

      return editor
    }

    return booleanTemplate
  }
