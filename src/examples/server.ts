import { contactFormExample } from './contact-form'
import { simpleArrayExample } from './simple-array'
import { nestedArrayExample } from './nested-array'

console.log( 'Contact Form:\n\n' )

Object.keys( contactFormExample ).forEach( key => {
  console.log( key )
  console.log( contactFormExample[ key ] )
  console.log()
} )

console.log( 'Simple Array:\n\n' )

Object.keys( simpleArrayExample ).forEach( key => {
  console.log( key )
  console.log( simpleArrayExample[ key ] )
  console.log()
} )

console.log( 'Nested Array:\n\n' )

Object.keys( nestedArrayExample ).forEach( key => {
  console.log( key )
  console.log( nestedArrayExample[ key ] )
  console.log()
} )