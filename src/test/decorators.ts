import * as assert from 'assert'
import { document, Event, getEntries, form } from '../server/dom'
import { ArrayTemplate } from '../templates/types/array'
import { FieldsetDecorator } from '../templates/decorators/fieldset'
import { StringTemplate } from '../templates/types/string'
import { FormatDecorator } from '../templates/decorators/format'
import { LabelDecorator } from '../templates/decorators/label'
import { MutableArrayListDecorator, MutableArrayItemDecorator } from '../templates/decorators/mutable-array-list';
import { ArrayListTemplate } from '../templates/array-list';
import { Templates } from '../types';
import { ArrayItemTemplate } from '../templates/array-item';

describe( 'schema-forms', () => {
  describe( 'decorators', () => {
    describe( 'fieldset', () => {
      it( 'decorates', () => {
        const arrayTemplate = ArrayTemplate( document )
        const fieldsetArrayTemplate = FieldsetDecorator(
          document, arrayTemplate
        )

        const container = fieldsetArrayTemplate(
          { title: 'Foo', type: 'array' }
        )

        assert.strictEqual( container.localName, 'fieldset' )

        const legend = container.querySelector( 'legend' )

        assert( legend )
        assert.strictEqual( legend!.innerHTML, 'Foo' )
      })

      it( 'decorates without legend', () => {
        const arrayTemplate = ArrayTemplate( document )
        const fieldsetArrayTemplate = FieldsetDecorator(
          document, arrayTemplate, false
        )

        const container = fieldsetArrayTemplate(
          { title: 'Foo', type: 'array' }
        )

        assert.strictEqual( container.localName, 'fieldset' )

        const legend = container.querySelector( 'legend' )

        assert.strictEqual( legend, null )
      })
    })

    describe( 'label', () => {
      it( 'decorates', () => {
        const labelDecorator = LabelDecorator(
          document,
          StringTemplate( document )
        )

        const editor = labelDecorator( { type: 'string' } )

        assert.strictEqual( editor.localName, 'label' )

        const input = editor.lastElementChild

        assert( input )
        assert.strictEqual( ( <HTMLInputElement>input ).type, 'text' )
      })

      it( 'isSuffix true', () => {
        const labelDecorator = LabelDecorator(
          document,
          StringTemplate( document ),
          true
        )

        const editor = labelDecorator( { type: 'string' } )

        assert.strictEqual( editor.localName, 'label' )

        const input = editor.firstElementChild

        assert( input )
        assert.strictEqual( ( <HTMLInputElement>input ).type, 'text' )
      })
    })

    describe( 'format', () => {
      it( 'template from format', () => {
        const stringTemplates = {
          string: StringTemplate( document ),
          multiline: StringTemplate( document, true )
        }

        const formatDecorator = FormatDecorator( document, stringTemplates )

        const multilineEl = formatDecorator( {
          type: 'string',
          format: 'multiline'
        })

        assert.strictEqual( multilineEl.localName, 'textarea' )
      })

      it( 'ignores strings with no format', () => {
        const stringTemplates = {
          string: StringTemplate( document )
        }

        const formatDecorator = FormatDecorator( document, stringTemplates )

        const el = <HTMLInputElement>formatDecorator( { type: 'string' } )

        assert.strictEqual( el.type, 'text' )
      })

      it( 'passes format through to type directly', () => {
        const stringTemplates = {
          string: StringTemplate( document )
        }

        const formatDecorator = FormatDecorator( document, stringTemplates )

        const el = <HTMLInputElement>formatDecorator(
          { type: 'string', format: 'color' }
        )

        assert.strictEqual( el.type, 'color' )
      })

      it( 'finds input when decorated with wrapper element', () => {
        const stringTemplates = {
          string: LabelDecorator(
            document,
            StringTemplate( document )
          )
        }

        const formatDecorator = FormatDecorator( document, stringTemplates )

        const el = <HTMLInputElement>formatDecorator(
            { type: 'string', format: 'color' }
          )

        const input = el.querySelector( 'input' )!

        assert.strictEqual( input.type, 'color' )
      })

      it( 'fails when no input element', () => {
        const stringTemplates = {
          string: StringTemplate( document, true )
        }

        const formatDecorator = FormatDecorator( document, stringTemplates )

        assert.throws( () => {
          formatDecorator(
            { type: 'string', format: 'color' }
          )
        })
      })
    })

    describe( 'mutable-array-list', () => {
      const templates: Partial<Templates> = {
        string: StringTemplate( document )
      }

      templates.arrayList = MutableArrayListDecorator(
        document,
        ArrayListTemplate( document, templates ),
        templates
      )

      templates.arrayItem = MutableArrayItemDecorator(
        document,
        ArrayItemTemplate( document, templates )
      )

      const click = new Event( 'click', { bubbles: true } )

      it( 'creates an add action', () => {
        const container = templates.arrayList!(
          { type: 'array', items: { type: 'string' } }
        )

        const addActions = container.querySelectorAll( '[data-action="array-list-add"]' )

        assert.strictEqual( addActions.length, 1 )
      })

      it( 'creates a delete action', () => {
        const item = templates.arrayItem!(
          { type: 'string' }
        )

        const deleteActions = item.querySelectorAll( '[data-action="array-list-delete"]' )

        assert.strictEqual( deleteActions.length, 1 )
      } )

      it( 'adds', () => {
        const container = templates.arrayList!(
          { type: 'array', items: { type: 'string' } }
        )

        const addAction = container.querySelector( '[data-action="array-list-add"]' )!

        addAction.dispatchEvent( click )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ '0', '' ],
            [ '1', '' ]
          ]
        )
      })

      it( 'removes', () => {
        const container = templates.arrayList!(
          { type: 'array', items: { type: 'string' } }
        )

        const addAction = container.querySelector( '[data-action="array-list-add"]' )!

        addAction.dispatchEvent( click )
        addAction.dispatchEvent( click )

        const deleteActions = Array.from(
          container.querySelectorAll( '[data-action="array-list-delete"]' )
        )

        assert.strictEqual( deleteActions.length, 3 )

        deleteActions[ 1 ].dispatchEvent( click )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ '0', '' ],
            [ '1', '' ]
          ]
        )
      } )

      it( 'adds with parent name', () => {
        const container = templates.arrayList!(
          { type: 'array', items: { type: 'string' } }, 'foo'
        )

        const addAction = container.querySelector( '[data-action="array-list-add"]' )!

        addAction.dispatchEvent( click )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ 'foo[0]', '' ],
            [ 'foo[1]', '' ]
          ]
        )
      } )

      it( 'schema must be array-list', () => {
        assert.throws( () => templates.arrayList!(
          { type: 'array' }
        ))
      })

      it( 'button without LI ancestor does not delete', () => {
        const container = templates.arrayList!(
          { type: 'array', items: { type: 'string' } }
        )

        const deleteAction = container.querySelector( '[data-action="array-list-delete"]' )!

        container.appendChild( deleteAction )

        deleteAction.dispatchEvent( click )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ '0', '' ]
          ]
        )
      })
    })
  })
})