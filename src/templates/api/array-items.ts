import { Templates } from '../../types'
import { JSONSchema4 } from 'json-schema'

export const ArrayItemsApi =
  ( document: Document, templates: Partial<Templates> = {} ) => {
    const { arrayItems } = templates

    if( !arrayItems ) throw Error( 'ArrayItemsApi: missing template arrayItems' )

    const arrayItemsApi: any = {}

    const Api = ( container: HTMLElement, schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
      const list = container.querySelector( 'ol' )

      if( !list )
        throw Error(
          'ArrayItemsApi: arrayItems did not create an ol child'
        )

      if ( !schema.items || Array.isArray( schema.items ) )
        throw Error(
          'ArrayItemsApi: schema.items should be a schema'
        )

      const childSchema = schema.items

      if ( typeof childSchema.type !== 'string' )
        throw Error(
          'ArrayItemsApi: schema.items.type should be a string'
        )

      const template = templates[ childSchema.type ]

      if( !template )
        throw Error(
          `ArrayItemsApi: missing template ${ childSchema.type }`
        )

      const count = () => list.childElementCount

      const clear = () => list.innerHTML = ''

      const add = ( defaultValue?: any ) => {
        const key = count()
        const li = document.createElement( 'li' )

        const childName = name ? `${ name }[${ key }]` : `[${ key }]`

        const editorItem = template( childSchema, childName, defaultValue )

        li.appendChild( editorItem )

        list.appendChild( li )

        return key
      }

      const remove = ( index: number ) => {
        if( index >= count() )
          throw Error( 'ArrayItemsApi: remove index out of bounds' )

        const previousCount = count()

        list.children[ index ].remove()

        renumber( previousCount, index + 1 )
      }

      const renumber = ( previousCount: number, from: number ) => {
        for( let i = from; i < previousCount; i++ ){
          const oldName = `${ name }[${ i }]`
          const newName = `${ name }[${ i - 1 }]`

          const targets = <HTMLInputElement[]>Array.from(
            list.querySelectorAll( `input[name]` )
          )

          targets.forEach( target => {
            if( target.name.startsWith( oldName ) ){
              target.name = target.name.replace( oldName, newName )
            }
          })
        }
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

    const arrayItemsDecorator = ( schema: JSONSchema4, name = '', defaultValue?: any[] ) => {
      const container = arrayItems( schema, name, defaultValue )

      if( name in arrayItemsApi )
        throw Error(
          `ArrayItemsApi: name ${ name } already exists, create a new API for each form you generate`
        )

      arrayItemsApi[ name ] = Api( container, schema, name, defaultValue )

      return container
    }

    return { arrayItemsDecorator, arrayItemsApi }
  }