import { JSDOM } from 'jsdom'
import { Form } from '../templates/utils'

const jsdom = new JSDOM( `<!doctype html>` )

export const { document, FormData, Event } = jsdom.window
export const form = Form( document )
