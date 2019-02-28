import { ElementDecorator, ElementDecoratorFactory } from '../types'

const canName =
  ( element: HTMLElement ): element is HTMLInputElement | HTMLTextAreaElement =>
    (
      ( element instanceof HTMLInputElement )
      ||
      ( element instanceof HTMLTextAreaElement )
    )
    &&
    !element.name

export const NameDecorator: ElementDecoratorFactory =
  ( _document: Document ) => {
    const nameDecorator: ElementDecorator = ( element: HTMLElement ) => {
      if ( !canName( element ) ) return element

      let name = ''
      let keyEl = <HTMLElement | null>element.closest( '[data-key]' )

      while ( keyEl ) {
        const { key } = keyEl.dataset

        if ( key ) name = `/${ key }${ name }`

        keyEl = <HTMLElement | null>element.closest( '[data-key]' )
      }

      element.name = name

      return element
    }

    return nameDecorator
  }
