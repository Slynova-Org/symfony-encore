import { readFile } from 'fs/promises'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class EncoreProvider {
  constructor (protected application: ApplicationContract) {}
  public static needsApplication = true

  public async boot () {
    if (!this.application.container.hasBinding('Adonis/Core/View')) {
      throw new Error('You need to install the @adonisjs/view package to use this package')
    }

    this.application.container.with(['Adonis/Core/View'],
      async (View) => {
        try {
          const entrypointsFilePath = this.application.publicPath('/build/entrypoints.json')
          const entrypointsFile = await readFile(entrypointsFilePath)
          const { entrypoints, integrity } = JSON.parse(entrypointsFile.toString())

          View.global('encoreLink', (entry: string) => {
            const files = entrypoints[entry]['css']

            return files.map((file: string) => {
              let html = `<link rel="stylesheet" href="${file}"`

              if (integrity && integrity[file]) {
                html += ` integrity="${integrity[file]}"`
              }

              html += '>'

              return html
            }).join('')
          })

          View.global('encoreScript', (entry: string, defer = true) => {
            const files = entrypoints[entry]['js']

            return files.map((file: string) => {
              let html = `<script src="${file}"`

              if (integrity && integrity[file]) {
                html += ` integrity="${integrity[file]}"`
              }

              if (defer) {
                html += ' defer'
              }

              html += '></script>'

              return html
            }).join('')
          })
        } catch (e) {
          //
        }
      })
  }
}
