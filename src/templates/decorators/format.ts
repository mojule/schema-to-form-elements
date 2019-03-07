import { StringFormatTemplates } from '../../types'
import { JSONSchema4 } from 'json-schema'

export const FormatDecorator =
  (
    _document: Document,
    stringTemplates: StringFormatTemplates,
    formatToTemplateKey = new Map<string,string>(),
    formatToTypeAttribute = defaultFormatToType
  ) => {
    const formatDecorator = ( schema: JSONSchema4 = {}, name = '', value?: any[], isRequired = false ) => {
      const stringTemplate = stringTemplates.string

      let format: string

      if( typeof schema.format !== 'string' ){
        return stringTemplate( schema, name, value, isRequired )
      }

      format = formatToTemplateKey.get( schema.format ) || schema.format

      if ( typeof stringTemplates[ format ] !== 'undefined' ){
        return stringTemplates[ format ]!( schema, name, value, isRequired )
      }

      const editor = stringTemplate( schema, name, value, isRequired )

      const input = <HTMLInputElement | null>(
        editor.matches( 'input' ) ? editor :
          editor.querySelector( 'input' )
      )

      if ( !input )
        throw Error( 'formatDecorator could not find an input element!' )

      format = formatToTypeAttribute.get( schema.format ) || schema.format

      input.type = format

      return editor
    }

    return formatDecorator
  }

export const defaultFormatToType = new Map<string, string>()

defaultFormatToType.set( 'date-time', 'datetime-local' )
defaultFormatToType.set( 'uri', 'url' )
