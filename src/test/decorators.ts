import * as assert from 'assert'
import { document, Event, form } from '../server/dom'
import { Templates } from '../types'
import {
  ArrayTemplate, FieldsetDecorator, LabelDecorator, StringTemplate,
  FormatDecorator, MutableArrayListDecorator, ArrayListTemplate,
  MutableArrayItemDecorator, ArrayItemTemplate, getEntries
} from '..'
import { TypeDecorator } from '../templates/decorators/type'

describe( 'schema-forms', () => {
  describe( 'decorators', () => {
    describe( 'fieldset', () => {
      it( 'decorates', () => {
        const arrayTemplate = ArrayTemplate( document )
        const fieldsetArrayTemplate = FieldsetDecorator(
          document, arrayTemplate
        )

        const container = fieldsetArrayTemplate(
          { title: 'Foo' }
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
          { title: 'Foo' }
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

        const editor = labelDecorator()

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

        const editor = labelDecorator()

        assert.strictEqual( editor.localName, 'label' )

        const input = editor.firstElementChild

        assert( input )
        assert.strictEqual( ( <HTMLInputElement>input ).type, 'text' )
      })

      it( 'label contains asterisk if required', () => {
        const labelDecorator = LabelDecorator(
          document,
          StringTemplate( document )
        )

        const editor = labelDecorator( {}, '', '', true )
        const span = editor.querySelector( 'span' )!

        assert( span.innerHTML.includes( '*' ) )
      } )
    })

    describe( 'format', () => {
      it( 'template from format', () => {
        const stringTemplates = {
          string: StringTemplate( document ),
          multiline: StringTemplate( document, true )
        }

        const formatDecorator = FormatDecorator( document, stringTemplates )

        const multilineEl = formatDecorator( {
          format: 'multiline'
        })

        assert.strictEqual( multilineEl.localName, 'textarea' )
      })

      it( 'ignores strings with no format', () => {
        const stringTemplates = {
          string: StringTemplate( document )
        }

        const formatDecorator = FormatDecorator( document, stringTemplates )

        const el = <HTMLInputElement>formatDecorator()

        assert.strictEqual( el.type, 'text' )
      })

      it( 'passes format through to type directly', () => {
        const stringTemplates = {
          string: StringTemplate( document )
        }

        const formatDecorator = FormatDecorator( document, stringTemplates )

        const el = <HTMLInputElement>formatDecorator(
          { format: 'color' }
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
            { format: 'color' }
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
            { format: 'color' }
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
        Event,
        ArrayListTemplate( document, templates ),
        templates
      )

      templates.arrayItem = MutableArrayItemDecorator(
        document,
        ArrayItemTemplate( document, templates )
      )

      it( 'creates an add action', () => {
        const container = templates.arrayList!(
          { items: { type: 'string' } }
        )

        const addActions = container.querySelectorAll( '[data-action="array-list-add"]' )

        assert.strictEqual( addActions.length, 1 )
      })

      it( 'creates an empty container when no schema', () => {
        const container = templates.arrayList!()

        assert.strictEqual( container.childElementCount, 0 )
      } )

      it( 'creates an empty container when items is an array', () => {
        const container = templates.arrayList!( { items: [] } )

        assert.strictEqual( container.childElementCount, 0 )
      } )

      it( 'creates an empty container when items has no type', () => {
        const container = templates.arrayList!(
          { items: {} }
        )

        assert.strictEqual( container.childElementCount, 0 )
      } )

      it( 'creates a delete action', () => {
        const item = templates.arrayItem!(
          { type: 'string' }
        )

        const deleteActions = item.querySelectorAll( '[data-action="array-list-delete"]' )

        assert.strictEqual( deleteActions.length, 1 )
      } )

      it( 'creates an li with a single button when no type', () => {
        const item = templates.arrayItem!()

        assert.strictEqual( item.childElementCount, 1 )

        const deleteActions = item.querySelectorAll( '[data-action="array-list-delete"]' )

        assert.strictEqual( deleteActions.length, 1 )
      } )

      it( 'adds', () => {
        const container = templates.arrayList!(
          { items: { type: 'string' } }
        )

        const addAction = container.querySelector( '[data-action="array-list-add"]' )!

        addAction.dispatchEvent( new Event( 'click', { bubbles: true } ) )

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

        addAction.dispatchEvent( new Event( 'click', { bubbles: true } ) )
        addAction.dispatchEvent( new Event( 'click', { bubbles: true } ) )

        const deleteActions = Array.from(
          container.querySelectorAll( '[data-action="array-list-delete"]' )
        )

        assert.strictEqual( deleteActions.length, 3 )

        deleteActions[ 1 ].dispatchEvent( new Event( 'click', { bubbles: true } ) )

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

        addAction.dispatchEvent( new Event( 'click', { bubbles: true } ) )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ 'foo[0]', '' ],
            [ 'foo[1]', '' ]
          ]
        )
      } )

      it( 'button without LI ancestor does not delete', () => {
        const container = templates.arrayList!(
          { type: 'array', items: { type: 'string' } }
        )

        const deleteAction = container.querySelector( '[data-action="array-list-delete"]' )!

        container.appendChild( deleteAction )

        deleteAction.dispatchEvent( new Event( 'click', { bubbles: true } ) )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ '0', '' ]
          ]
        )
      })

      it( 'click on container does not add or remove', () => {
        const container = templates.arrayList!(
          { type: 'array', items: { type: 'string' } }
        )

        container.dispatchEvent( new Event( 'click', { bubbles: true } ) )

        const entries = getEntries( form( {}, container ) )

        assert.deepEqual(
          entries,
          [
            [ '0', '' ]
          ]
        )
      } )
    })

    describe( 'type', () => {
      it( 'decorates name with type', () => {
        const stringTemplate = TypeDecorator(
          document,
          StringTemplate( document )
        )

        const input = <HTMLInputElement>stringTemplate(
          { type: 'string' }, 'foo'
        )

        assert.strictEqual( input.name, 'foo__string' )
      })

      it( 'no default name', () => {
        const stringTemplate = TypeDecorator(
          document,
          StringTemplate( document )
        )

        const input = <HTMLInputElement>stringTemplate(
          { type: 'string' }
        )

        assert.strictEqual( input.name, '__string' )
      })

      it( 'does not decorate when no type', () => {
        const stringTemplate = TypeDecorator(
          document,
          StringTemplate( document )
        )

        const input = <HTMLInputElement>stringTemplate()

        assert( !input.hasAttribute( 'name' ) )
      } )
    })
  })
})