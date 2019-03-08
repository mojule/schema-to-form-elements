import * as assert from 'assert'
import { JSONSchema4 } from 'json-schema'
import { document } from '../server/dom'
import { SchemaTemplate } from '../types'
import { BooleanTemplate, NumberTemplate, StringTemplate } from '..'

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
          it( 'expected type', () => {
            const input = <HTMLInputElement>templates[ type ]()

            assert.strictEqual( input.type, inputType )
          } )

          it( 'default title', () => {
            const input = <HTMLInputElement>templates[ type ](
              <JSONSchema4>{ type }
            )

            assert.strictEqual( input.title, inputTitle )
          } )

          it( 'name', () => {
            const input = <HTMLInputElement>templates[ type ]( {}, type )

            assert.strictEqual( input.name, type )
          } )

          it( 'value', () => {
            const input = <HTMLInputElement>templates[ type ](
              {}, type, values[ type ]
            )

            assert.strictEqual( input[ valueProperties[ type ] ], inputValue )
          } )

          it( 'value from default', () => {
            const input = <HTMLInputElement>templates[ type ](
              { default: values[ type ] },
              type
            )

            assert.strictEqual( input[ valueProperties[ type ] ], inputValue )
          } )

          if ( type === 'boolean' ) {
            it( 'value is false', () => {
              const input = <HTMLInputElement>templates[ type ](
                {}, type, false
              )

              assert.strictEqual( input[ valueProperties[ type ] ], false )
            } )

            it( 'value from default is false', () => {
              const input = <HTMLInputElement>templates[ type ](
                { default: false },
                type
              )

              assert.strictEqual( input[ valueProperties[ type ] ], false )
            } )
          } else {
            it( 'required', () => {
              const input = <HTMLInputElement>templates[ type ](
                {}, type, values[ type ], true
              )

              assert( input.required )
            } )
          }

          if ( type === 'number' || type === 'integer' ) {
            it( 'step matches multipleOf', () => {
              const input = <HTMLInputElement>templates[ type ](
                { multipleOf: 2 }
              )

              assert.strictEqual( input.step, '2' )
            } )

            it( 'min matches minimum', () => {
              const input = <HTMLInputElement>templates[ type ](
                { minimum: 2 }
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
              const input = <HTMLInputElement>NumberTemplate( document, true )()

              assert.strictEqual( input.type, 'range' )
            } )
          }

          if ( type === 'integer' ) {
            it( 'step is 1 if no multipleOf', () => {
              const input = <HTMLInputElement>templates[ type ](
                { type: 'integer' }
              )

              assert.strictEqual( input.step, '1' )
            } )
          }

          if ( type === 'string' ) {
            it( 'multiline', () => {
              const input = StringTemplate( document, true )()

              assert.strictEqual( input.localName, 'textarea' )
            } )

            it( 'pattern', () => {
              const input = <HTMLInputElement>templates[ type ](
                { pattern: '.*' }
              )

              assert.strictEqual( input.pattern, '.*' )
            } )

            it( 'minLength', () => {
              const input = <HTMLInputElement>templates[ type ](
                { minLength: 2 }
              )

              assert.strictEqual( input.minLength, 2 )
            } )

            it( 'maxLength', () => {
              const input = <HTMLInputElement>templates[ type ](
                { maxLength: 2 }
              )

              assert.strictEqual( input.maxLength, 2 )
            } )
          }
        } )
      } )
    } )
  } )
} )
