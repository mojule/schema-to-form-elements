import { JSONSchema4 } from 'json-schema'
import { Templates, SchemaTemplate } from '../../types'
import { ArrayListApi } from '../api/array-list'
import { getTitle } from '../utils'

// TODO enforce minItems/maxItems

export const MutableArrayListDecorator =
  (
    document: Document,
    arrayList: SchemaTemplate,
    templates: Partial<Templates>
  ) => {
    const mutableArrayListDecorator = ( schema: JSONSchema4 = {}, name = '', value?: any[] ) => {
      const container = arrayList( schema, name, value )

      if (
        !schema.items ||
        Array.isArray( schema.items ) ||
        typeof schema.items.type !== 'string'
      ) return container

      const api = ArrayListApi( document, container, schema, templates )

      const title = `Add ${ getTitle( schema.items, '', 'Item' ) }`

      const addButton = document.createElement( 'button' )

      addButton.type = 'button'
      addButton.innerHTML = title
      addButton.dataset.action = 'array-list-add'

      container.appendChild( addButton )

      container.addEventListener( 'click', e => {
        const target = <HTMLElement>e.target

        if ( target.dataset.action === 'array-list-add' ) {
          e.stopPropagation()

          api.add()
        }

        if ( target.dataset.action === 'array-list-delete' ) {
          e.stopPropagation()

          const li = target.closest( 'li' )

          // can't throw errors in event handlers, no way to catch them
          // when using dispatchEvent so throwing makes this untestable
          if ( !li ) return

          const index = Array.from(
            li.parentNode!.children
          ).indexOf( li )

          api.remove( index )
        }
      })

      return container
    }

    return mutableArrayListDecorator
  }

export const MutableArrayItemDecorator =
  (
    document: Document,
    arrayItem: SchemaTemplate
  ) => {
    const mutableArrayItemDecorator = ( schema: JSONSchema4 = {}, name = '', value?: any ) => {
      const item = arrayItem( schema, name, value )

      const title = `Delete ${ getTitle( schema, name, 'Item' ) }`

      const deleteButton = document.createElement( 'button' )

      deleteButton.type = 'button'
      deleteButton.innerHTML = title
      deleteButton.dataset.action = 'array-list-delete'

      item.appendChild( deleteButton )

      return item
    }

    return mutableArrayItemDecorator
  }
