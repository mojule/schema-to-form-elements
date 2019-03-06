import * as assert from 'assert'
import { document } from '../server/dom'
import { JSONSchema4 } from 'json-schema'
import { BooleanTemplate } from '../templates/types/boolean'
import { NumberTemplate } from '../templates/types/number'
import { StringTemplate } from '../templates/types/string'
import { SchemaTemplate } from '../types'

describe( 'schema-forms', () => {
  describe( 'primitives', () => {
    describe( 'creates input from primitive type', () => {
      const expectInputType = {
        boolean: 'checkbox',
        number: 'number',
        integer: 'number',
        string: 'text'
      }

      const expectTitle = {
        boolean: 'Boolean',
        number: 'Number',
        integer: 'Integer',
        string: 'String'
      }

      const expectValue = {
        boolean: true,
        number: '1.1',
        integer: '1',
        string: 'foo'
      }

      const templates: { [ key: string ]: SchemaTemplate } = {
        boolean: BooleanTemplate( document ),
        number: NumberTemplate( document ),
        integer: NumberTemplate( document ),
        string: StringTemplate( document )
      }

      const values = {
        boolean: true,
        number: 1.1,
        integer: 1,
        string: 'foo'
      }

      const valueProperties = {
        boolean: 'checked',
        number: 'defaultValue',
        integer: 'defaultValue',
        string: 'defaultValue'
      }

      Object.keys( expectInputType ).forEach( type => {
        const inputType = expectInputType[ type ]
        const inputTitle = expectTitle[ type ]
        const inputValue = expectValue[ type ]

        describe( `input[type="${ inputType }"] from ${ type } schema`, () => {
          const schema = <JSONSchema4>{ type }
          it( 'expected type', () => {
            const input = <HTMLInputElement>templates[ type ]( schema )

            assert.strictEqual( input.type, inputType )
          } )

          it( 'default title', () => {
            const input = <HTMLInputElement>templates[ type ](
              <JSONSchema4>{ type }
            )

            assert.strictEqual( input.title, inputTitle )
          } )

          it( 'name', () => {
            const input = <HTMLInputElement>templates[ type ]( schema, type )

            assert.strictEqual( input.name, type )
          } )

          it( 'value', () => {
            const input = <HTMLInputElement>templates[ type ](
              schema, type, values[ type ]
            )

            assert.strictEqual( input[ valueProperties[ type ] ], inputValue )
          } )

          it( 'value from default', () => {
            const input = <HTMLInputElement>templates[ type ](
              <JSONSchema4>{ type, default: values[ type ] },
              type
            )

            assert.strictEqual( input[ valueProperties[ type ] ], inputValue )
          } )

          if ( type === 'boolean' ) {
            it( 'value is false', () => {
              const input = <HTMLInputElement>templates[ type ](
                schema, type, false
              )

              assert.strictEqual( input[ valueProperties[ type ] ], false )
            } )

            it( 'value from default is false', () => {
              const input = <HTMLInputElement>templates[ type ](
                <JSONSchema4>{ type, default: false },
                type
              )

              assert.strictEqual( input[ valueProperties[ type ] ], false )
            } )
          }

          it( 'required', () => {
            const input = <HTMLInputElement>templates[ type ](
              schema, type, values[ type ], true
            )

            assert( input.required )
          } )

          if ( type === 'number' || type === 'integer' ) {
            it( 'step matches multipleOf', () => {
              const input = <HTMLInputElement>templates[ type ](
                <JSONSchema4>{ type, multipleOf: 2 }
              )

              assert.strictEqual( input.step, '2' )
            } )

            it( 'min matches minimum', () => {
              const input = <HTMLInputElement>templates[ type ](
                <JSONSchema4>{ type, minimum: 2 }
              )

              assert.strictEqual( input.min, '2' )
            } )

            it( 'max matches maximum', () => {
              const input = <HTMLInputElement>templates[ type ](
                <JSONSchema4>{ type, maximum: 2 }
              )

              assert.strictEqual( input.max, '2' )
            } )

            it( 'range', () => {
              const input = <HTMLInputElement>NumberTemplate( document, true )(
                schema
              )

              assert.strictEqual( input.type, 'range' )
            } )
          }

          if ( type === 'integer' ) {
            it( 'step is 1 if no multipleOf', () => {
              const input = <HTMLInputElement>templates[ type ]( schema )

              assert.strictEqual( input.step, '1' )
            } )
          }

          if ( type === 'string' ) {
            it( 'multiline', () => {
              const input = StringTemplate( document, true )(
                schema
              )

              assert.strictEqual( input.localName, 'textarea' )
            } )

            it( 'pattern', () => {
              const input = <HTMLInputElement>templates[ type ](
                <JSONSchema4>{ type, pattern: '.*' }
              )

              assert.strictEqual( input.pattern, '.*' )
            } )

            it( 'minLength', () => {
              const input = <HTMLInputElement>templates[ type ](
                <JSONSchema4>{ type, minLength: 2 }
              )

              assert.strictEqual( input.minLength, 2 )
            } )

            it( 'maxLength', () => {
              const input = <HTMLInputElement>templates[ type ](
                <JSONSchema4>{ type, maxLength: 2 }
              )

              assert.strictEqual( input.maxLength, 2 )
            } )
          }
        } )
      } )
    } )
  } )
} )
