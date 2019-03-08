import * as assert from 'assert'
import { document, FormData } from '../server/dom'
import {
  getTitle, Form, H, getEntries, entriesToPointers, keyToJsonPointer,
  getChildName
} from '../templates/utils'
import { StringTemplate } from '../templates/types/string'
import { TupleTemplate } from '../templates/types/array/tuple'
import { TypeDecorator } from '../templates/decorators/type';
import { NumberTemplate, BooleanTemplate } from '..';

describe( 'utils', () => {
  describe( 'getTitle', () => {
    it( 'gets title from schema', () => {
      const title = getTitle( { title: 'Title' } )

      assert.strictEqual( title, 'Title' )
    } )

    it( 'gets title from name', () => {
      const title = getTitle( {}, 'Title' )

      assert.strictEqual( title, 'Title' )
    } )

    it( 'gets title from default fallback', () => {
      const title = getTitle( {} )

      assert.strictEqual( title, 'Schema' )
    } )

    it( 'gets title from explicit fallback', () => {
      const title = getTitle( {}, '', 'Title' )

      assert.strictEqual( title, 'Title' )
    } )
  })

  describe( 'getChildName', () => {
    it( 'uses square brackets if parent name', () => {
      const name = getChildName( 'foo', 0 )

      assert.strictEqual( name, 'foo[0]' )
    } )

    it( 'does not use square brackets if no parent name', () => {
      const name = getChildName( '', 0 )

      assert.strictEqual( name, '0' )
    } )
  })

  describe( 'H', () => {
    it( 'creates HTML templates', () => {
      const div = H( document, 'div' )
      const span = H( document, 'span' )
      const el = div( { id: 'foo' }, span() )

      assert.strictEqual( el.localName, 'div' )
      assert.strictEqual( el.id, 'foo' )
      assert.strictEqual( el.firstElementChild!.localName, 'span' )
    })
  })

  describe( 'Form', () => {
    const form = Form( document )

    it( 'generates a form element', () => {
      const el = form()

      assert.strictEqual( el.localName, 'form' )
    })
  })

  describe( 'entries', () => {
    const form = Form( document )
    const stringTemplate = StringTemplate( document )
    const tupleTemplate = TupleTemplate( document, { string: stringTemplate } )

    const foo = tupleTemplate(
      {
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'string' },
          { type: 'string' }
        ],
        default: [
          'bar', 'baz'
        ]
      },
      'foo'
    )

    const tupleFormEl = form( {}, foo )

    it( 'gets entries from a form', () => {
      const entries = getEntries( tupleFormEl )

      assert.deepEqual(
        entries,
        [
          [ 'foo[0]', 'bar' ],
          [ 'foo[1]', 'baz' ],
          [ 'foo[2]', '' ]
        ]
      )
    })

    it( 'gets entries from a typed form', () => {
      const tupleTemplate = TupleTemplate( document, {
        string: TypeDecorator( document, StringTemplate( document ) ),
        number: TypeDecorator( document, NumberTemplate( document ) ),
        boolean: TypeDecorator( document, BooleanTemplate( document ) )
      } )

      const foo = tupleTemplate(
        {
          type: 'array',
          items: [
            { type: 'string' },
            { type: 'number' },
            { type: 'boolean' },
            { type: 'boolean' }
          ],
          default: [
            'bar', 1.1, true, false
          ]
        },
        'foo'
      )

      const tupleFormEl = form( {}, foo )

      const entries = getEntries( tupleFormEl )

      assert.deepEqual(
        entries,
        [
          [ 'foo[0]', 'bar' ],
          [ 'foo[1]', 1.1 ],
          [ 'foo[2]', true ],
          [ 'foo[3]', false ]
        ]
      )
    })

    it( 'keyToJsonPointer', () => {
      assert.strictEqual( keyToJsonPointer( '' ), '/' )
      assert.strictEqual( keyToJsonPointer( 'foo[0]' ), '/foo/0' )
      assert.strictEqual( keyToJsonPointer( '[0]' ), '/0' )
      assert.strictEqual( keyToJsonPointer( '0' ), '/0' )
    })

    it( 'gets pointers from entries', () => {
      const tuplePointers = entriesToPointers(
        getEntries( tupleFormEl )
      )

      assert.deepEqual(
        tuplePointers,
        [
          [ '/foo/0', 'bar' ],
          [ '/foo/1', 'baz' ],
          [ '/foo/2', '' ]
        ]
      )
    })
  })
})