import { ElementDecorator, ElementDecoratorFactory } from '../types'

const canLabel =
  ( element: HTMLElement ): element is HTMLInputElement | HTMLTextAreaElement =>
    [ 'input', 'textarea' ].includes( element.localName ) &&
    !element.closest( 'label' )

export const LabelDecorator: ElementDecoratorFactory =
  ( document: Document ) => {
    const labelDecorator: ElementDecorator = ( element: HTMLElement ) => {
      if ( !canLabel( element ) ) return element

      const { title, type } = element.dataset

      if ( !title ) return element

      const label = document.createElement( 'label' )
      const span = document.createElement( 'span' )

      span.innerHTML = title

      if ( type === 'boolean' ) {
        label.appendChild( element )
        label.appendChild( span )
      } else {
        label.appendChild( span )
        label.appendChild( element )
      }

      return label
    }

    return labelDecorator
  }
