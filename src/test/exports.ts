import * as assert from 'assert'
import { document } from '../server/dom'
import { TypeTemplates } from '../templates/types'
import { ServerFormTemplates, ClientFormTemplates } from '../templates';
import { SchemaToFormElements } from '..';
import { StringTemplate } from '../templates/types/string';

describe( 'schema-forms', () => {
  describe( 'exports', () => {
    describe( 'TypeTemplates', () => {
      const typeTemplates = TypeTemplates( document )

      const localNames = {
        array: 'div',
        boolean: 'input',
        number: 'input',
        integer: 'input',
        object: 'div',
        string: 'input'
      }

      it( 'has all templates', () => {
        assert(
          Object.keys( localNames ).every( key => key in typeTemplates )
        )
        assert(
          Object.keys( typeTemplates ).every( key => key in localNames )
        )
      })

      Object.keys( typeTemplates ).forEach( name => {
        it( name, () => {
          const template = typeTemplates[ name ]
          const result = template( {} )

          assert.strictEqual( result.localName, localNames[ name ] )
        })
      })
    })

    describe( 'ServerFormTemplates', () => {
      const formTemplates = ServerFormTemplates( document )

      const localNames = {
        array: 'fieldset',
        boolean: 'label',
        number: 'label',
        integer: 'label',
        object: 'fieldset',
        string: 'label'
      }

      it( 'has all templates', () => {
        assert(
          Object.keys( localNames ).every( key => key in formTemplates )
        )
        assert(
          Object.keys( formTemplates ).every( key => key in localNames )
        )
      } )

      Object.keys( formTemplates ).forEach( name => {
        it( name, () => {
          const template = formTemplates[ name ]
          const result = template( {} )

          assert.strictEqual( result.localName, localNames[ name ] )
        } )
      } )
    })

    describe( 'ClientFormTemplates', () => {
      const clientFormTemplates = ClientFormTemplates( document )

      const localNames = {
        array: 'fieldset',
        boolean: 'label',
        number: 'label',
        integer: 'label',
        object: 'fieldset',
        string: 'label',
        arrayList: 'fieldset',
        arrayItem: 'li'
      }

      const schemas = {
        array: { items: { type: 'string' } },
        arrayList: { items: { type: 'string' } }
      }

      it( 'has all templates', () => {
        assert(
          Object.keys( localNames ).every( key => key in clientFormTemplates )
        )
        assert(
          Object.keys( clientFormTemplates ).every( key => key in localNames )
        )
      } )

      Object.keys( clientFormTemplates ).forEach( name => {
        it( name, () => {
          const template = clientFormTemplates[ name ]
          const schema = schemas[ name ] || {}
          const result = template( schema )

          assert.strictEqual( result.localName, localNames[ name ] )
        } )
      } )
    })

    describe( 'SchemaToFormElements', () => {
      const server = SchemaToFormElements(
        ServerFormTemplates( document )
      )

      const client = SchemaToFormElements(
        ClientFormTemplates( document )
      )

      describe( 'server', () => {
        const localNames = {
          array: 'fieldset',
          boolean: 'label',
          number: 'label',
          integer: 'label',
          object: 'fieldset',
          string: 'label'
        }

        Object.keys( localNames ).forEach( name => {
          it( name, () => {
            const result = server( <any>{ type: name } )

            assert.strictEqual( result.localName, localNames[ name ] )
          } )
        } )
      })

      describe( 'client', () => {
        const localNames = {
          array: 'fieldset',
          boolean: 'label',
          number: 'label',
          integer: 'label',
          object: 'fieldset',
          string: 'label'
        }

        const schemas = {
          array: { items: { type: 'string' } }
        }

        Object.keys( localNames ).forEach( name => {
          it( name, () => {
            const schema = schemas[ name ] || {}

            const result = client(
              <any>{ type: name, ...schema }
            )

            assert.strictEqual( result.localName, localNames[ name ] )
          } )
        } )
      })

      it( 'schema type must be a string', () => {
        assert.throws( () => server( {} ) )
      } )

      it( 'schema type must be a valid JSON schema type', () => {
        assert.throws( () => server( <any>{ type: 'arrayItem' } ) )
      } )

      it( 'must have template for type', () => {
        const templates = { string: StringTemplate( document ) }

        assert.throws( () => SchemaToFormElements( templates )(
          { type: 'number' }
        ) )
      })
    })
  })
})