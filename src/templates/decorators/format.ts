import { SchemaTemplate } from '../../types'
import { JSONSchema4 } from 'json-schema'

export const FormatDecorator =
  ( _document: Document, stringTemplate: SchemaTemplate, multilineTemplate: SchemaTemplate, formatToType = defaultFormatToType ) => {
    const formatDecorator = ( schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
      if( schema.format === 'multiline' ){
        return multilineTemplate( schema, name, defaultValue )
      }

      const editor = stringTemplate( schema, name, defaultValue )

      if( typeof schema.format === 'string' ){
        const input = <HTMLInputElement | null>(
          editor.matches( 'input' ) ? editor :
          editor.querySelector( 'input' )
        )

        if( !input )
          throw Error( 'formatDecorator could not find an input element!' )

        const format = formatToType.get( schema.format ) || schema.format

        input.type = format
      }

      return editor
    }

    return formatDecorator
  }

export const defaultFormatToType = new Map<string, string>()

defaultFormatToType.set( 'date-time', 'datetime-local' )
defaultFormatToType.set( 'uri', 'url' )
