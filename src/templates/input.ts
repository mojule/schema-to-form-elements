import { JSONSchema4 } from 'json-schema'
import { TemplateFactory } from '../types'

export const InputTemplate: TemplateFactory<HTMLInputElement> = ( document: Document ) => {
  const inputTemplate = ( schema: JSONSchema4 ) => {
    const editor = document.createElement( 'input' )

    if ( typeof schema.type === 'string' )
      editor.dataset.type = schema.type

    return editor
  }

  return inputTemplate
}