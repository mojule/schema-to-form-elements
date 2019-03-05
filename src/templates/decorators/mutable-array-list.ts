import { JSONSchema4 } from 'json-schema'
import { Templates, SchemaTemplate } from '../../types'
import { ArrayListApi } from '../api/array-list'
import { getTitle } from '../utils'

export const MutableArrayList =
  (
    document: Document,
    arrayList: SchemaTemplate, arrayItem: SchemaTemplate,
    templates: Partial<Templates> = {}
  ) => {
    const mutableArrayListDecorator = ( schema: JSONSchema4, name = '', value?: any[] ) => {
      const container = arrayList( schema, name, value )

      if ( !schema.items || Array.isArray( schema.items ) )
        throw Error( 'MutableArrayList: expected schema.items to be JSON Schema' )

      const api = ArrayListApi( container, schema, templates )

      const title = `Add ${ getTitle( schema.items, '', 'Item' ) }`

      const addButton = document.createElement( 'button' )

      addButton.type = 'button'
      addButton.innerHTML = title
      addButton.dataset.action = 'array-list-add'

      container.appendChild( addButton )

      container.addEventListener( 'click', e => {
        if( !( e.target instanceof HTMLButtonElement ) ) return

        if ( e.target.dataset.action === 'array-list-add' ) {
          e.stopPropagation()

          api.add()
        }

        if ( e.target.dataset.action === 'array-list-delete' ) {
          e.stopPropagation()

          const li = e.target.closest( 'li' )

          if ( !li )
            throw Error( 'MutableArrayList: expected delete action to have an LI parent' )

          const index = Array.from(
            li.parentNode!.children
          ).indexOf( li )

          console.log( `remove ${ index }` )

          api.remove( index )
        }
      })

      return container
    }

    const mutableArrayItemDecorator = ( schema: JSONSchema4, name = '', value?: any ) => {
      const item = arrayItem( schema, name, value )

      const title = `Delete ${ getTitle( schema, name, 'Item' ) }`

      const deleteButton = document.createElement( 'button' )

      deleteButton.type = 'button'
      deleteButton.innerHTML = title
      deleteButton.dataset.action = 'array-list-delete'

      item.appendChild( deleteButton )

      return item
    }

    return {
      mutableArrayListDecorator, mutableArrayItemDecorator
    }
  }