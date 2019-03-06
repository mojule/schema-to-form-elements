import { JSDOM } from 'jsdom'
import { GetEntries, Form } from '../templates/utils'

const jsdom = new JSDOM( `<!doctype html>` )

export const { document, FormData } = jsdom.window
export const getEntries = GetEntries( FormData )
export const form = Form( document )
