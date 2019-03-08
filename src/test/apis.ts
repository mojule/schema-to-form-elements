import * as assert from 'assert'
import { JSONSchema4 } from 'json-schema'
import { document, form } from '../server/dom'
import { Templates } from '../types'
import {
  StringTemplate, ArrayTemplate, ArrayListApi, ArrayItemTemplate, getEntries
} from '..'

describe( 'schema-forms', () => {
  describe( 'apis', () => {
    describe( 'array-list', () => {
      const templates: Partial<Templates> = {
        string: StringTemplate( document )
      }

      templates.array = ArrayTemplate( document, templates )

      const schema: JSONSchema4 = {
        type: 'array',
        items: {
          type: 'string'
        }
      }

      it( 'creates', () => {
        const container = templates.array!( schema )

        const api = ArrayListApi( document, container, schema, templates )

        assert( api )
      })

      it( 'container must have an OL', () => {
        const container = document.createElement( 'div' )

        assert.throws(
          () => ArrayListApi( document, container, schema, templates )
        )
      })

      it( 'schema must be array-list', () => {
        const container = templates.array!( schema )

        assert.throws(
          () => ArrayListApi( document, container, {}, templates )
        )

        assert.throws(
          () => ArrayListApi( document, container, { items: [] }, templates )
        )
      })

      it( 'child schema type must be a string', () => {
        const container = templates.array!( schema )

        assert.throws(
          () => ArrayListApi( document, container, { items: {} }, templates )
        )
      } )

      it( 'child schema must have a template', () => {
        const container = templates.array!( schema )

        assert.throws(
          () => ArrayListApi(
            document, container, { items: { type: 'number' } }, templates
          )
        )
      })

      it( 'count', () => {
        const container = templates.array!( schema )

        const api = ArrayListApi( document, container, schema, templates )

        assert.strictEqual( api.count, 1 )
      })

      it( 'clear', () => {
        const container = templates.array!( schema )

        const api = ArrayListApi( document, container, schema, templates )

        api.clear()

        assert.strictEqual( api.count, 0 )
      } )

      it( 'add with implicit arrayItem', () => {
        const container = templates.array!( schema )

        const api = ArrayListApi( document, container, schema, templates )

        api.add( 'bar' )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ '0', '' ],
            [ '1', 'bar' ]
          ]
        )
      } )

      it( 'add with explicit arrayItem', () => {
        const templates: Partial<Templates> = {
          string: StringTemplate( document )
        }

        templates.array = ArrayTemplate( document, templates )
        templates.arrayItem = ArrayItemTemplate( document, templates )

        const container = templates.array( schema )

        const api = ArrayListApi( document, container, schema, templates )

        api.add( 'bar' )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ '0', '' ],
            [ '1', 'bar' ]
          ]
        )
      } )

      it( 'add with name', () => {
        const container = templates.array!( schema, 'foo' )

        const api = ArrayListApi( document, container, schema, templates )

        api.add( 'bar' )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ 'foo[0]', '' ],
            [ 'foo[1]', 'bar' ]
          ]
        )
      } )

      it( 'removes', () => {
        const container = templates.array!( schema )

        const api = ArrayListApi( document, container, schema, templates )

        api.add( 'bar' )
        api.add( 'baz' )

        api.remove( 1 )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ '0', '' ],
            [ '1', 'baz' ]
          ]
        )
      })

      it( 'remove throws on bad index', () => {
        const container = templates.array!( schema )

        const api = ArrayListApi( document, container, schema, templates )

        assert.throws( () => api.remove( 1 ) )
      })
    })
  })
})