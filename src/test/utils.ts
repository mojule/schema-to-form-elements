import * as assert from 'assert'
import { document, FormData } from '../server/dom'
import { getTitle, Form, H, GetEntries, entriesToPointers, keyToJsonPointer } from '../templates/utils'
import { StringTemplate } from '../templates/types/string';
import { TupleTemplate } from '../templates/tuple';

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
      const entries = GetEntries( FormData )( tupleFormEl )

      assert.deepEqual(
        entries,
        [
          [ 'foo[0]', 'bar' ],
          [ 'foo[1]', 'baz' ],
          [ 'foo[2]', '' ]
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
        GetEntries( FormData )( tupleFormEl )
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