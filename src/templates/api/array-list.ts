import { Templates } from '../../types'
import { JSONSchema4 } from 'json-schema'
import { ArrayItemTemplate } from '../types/array/array-item'
import { getChildName } from '../utils'

// TODO enforce minItems/maxItems

export const ArrayListApi = ( document: Document, container: HTMLElement, schema: JSONSchema4, templates: Partial<Templates> ) => {
  const list = container.querySelector( 'ol' )

  if ( !list )
    throw Error(
      'ArrayListApi: container is missing OL'
    )

  if ( !schema.items || Array.isArray( schema.items ) )
    throw Error(
      'ArrayListApi: schema.items should be a schema'
    )

  const childSchema = schema.items

  if ( typeof childSchema.type !== 'string' )
    throw Error(
      'ArrayListApi: schema.items.type should be a string'
    )

  const template = templates[ childSchema.type ]

  if ( !template )
    throw Error(
      `ArrayListApi: missing template ${ childSchema.type }`
    )

  const name = container.dataset.name || ''

  const count = () => list.childElementCount

  const clear = () => { list.innerHTML = '' }

  const add = ( value?: any ) => {
    let arrayItem = templates.arrayItem

    if ( !arrayItem ){
      arrayItem = ArrayItemTemplate( document, templates )
    }

    const key = count()
    const childName = getChildName( name, count() )

    const li = arrayItem( childSchema, childName, value )

    list.appendChild( li )

    return key
  }

  const remove = ( index: number ) => {
    if ( index >= count() )
      throw Error( 'ArrayListApi: remove index out of bounds' )

    const previousCount = count()

    list.children[ index ].remove()

    renumber( previousCount, index + 1 )
  }

  const renumber = ( previousCount: number, from: number ) => {
    const name = container.dataset.name || ''

    for ( let i = from; i < previousCount; i++ ) {
      const oldName = getChildName( name, i )
      const newName = getChildName( name, i - 1 )

      const targets = <HTMLInputElement[]>Array.from(
        list.querySelectorAll( '[name]' )
      )

      targets.forEach( target => {
        if ( target.name.startsWith( oldName ) ) {
          target.name = target.name.replace( oldName, newName )
        }
      } )
    }
  }

  return <ArrayApi>{
    get count() {
      return count()
    },
    clear,
    add,
    remove
  }
}

export interface ArrayApi {
  readonly count: number
  clear: () => void
  add: ( value?: any ) => number
  remove: ( index: number ) => void
}
