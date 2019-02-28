import { Templates } from '../types'
import { ContainerTemplate } from './container'
import { InputTemplate } from './input'

export const ensureDefaultDependencies =
  ( document: Document, dependencies?: Partial<Templates> ): Templates => {
    const input = dependencies && dependencies.input || InputTemplate( document )
    const container = dependencies && dependencies.container || ContainerTemplate( document )

    return Object.assign( dependencies, { input, container } )
  }
