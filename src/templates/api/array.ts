import { Templates } from '../../types'
import { JSONSchema4 } from 'json-schema'

export const ArrayApi =
  ( _document: Document, templates: Partial<Templates> = {} ) => {
    const { arrayItems } = templates

    if( !arrayItems ) throw Error( 'ArrayApi: missing template arrayItems' )

    const api: any = {}

    const Api = ( container: HTMLElement, schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
      const list = container.querySelector( 'ol' )

      if( !list )
        throw Error(
          'ArrayApi: arrayItems did not create an ol child'
        )

      if ( !schema.items || Array.isArray( schema.items ) )
        throw Error(
          'ArrayApi: schema.items should be a schema'
        )

      const childSchema = schema.items

      if ( typeof childSchema.type !== 'string' )
        throw Error(
          'ArrayApi: schema.items.type should be a string'
        )

      const template = templates[ childSchema.type ]

      if( !template )
        throw Error(
          `ArrayApi: missing template ${ childSchema.type }`
        )

      const count = () => list.childElementCount

      const clear = () => list.innerHTML = ''

      const add = ( defaultValue?: any ) => {
        const key = count()
        const li = document.createElement( 'li' )

        const childName = name ? `${ name }[${ key }]` : String( key )

        const editorItem = template( childSchema, childName, defaultValue )

        li.appendChild( editorItem )

        list.appendChild( li )

        return key
      }

      const remove = ( index: number ) => {
        if( index >= count() )
          throw Error( 'ArrayApi: remove index out of bounds' )

        list.children[ index ].remove()

        renumber( index )
      }

      const renumber = ( from: number ) => {
        if( from === count() ) return

        // todo
      }

      return {
        get count(){
          return count()
        },
        get arraySchema(){
          return schema
        },
        get childSchema(){
          return <JSONSchema4>schema.items
        },
        get name() {
          return name
        },
        get defaultValue(){
          return defaultValue
        },
        clear, add, remove
      }
    }

    const arrayApiDecorator = ( schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
      const container = arrayItems( schema, name, defaultValue )

      api[ name ] = Api( container, schema, name, defaultValue )

      return container
    }

    return { arrayApiDecorator, api }
  }
