import { ElementDecorator } from '../types'

export const decorateAll =
  ( element: HTMLElement, ...decorators: ElementDecorator[] ) => {
    decorators.forEach( decorator => {
      element = decorator( element )
    })

    return element
  }