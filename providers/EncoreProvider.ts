import { readFile } from 'fs/promises'
import { IocContract } from '@adonisjs/fold'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class EncoreProvider {
  constructor (protected $container: IocContract) {}

  public async boot () {
    if (!this.$container.hasBinding('Adonis/Core/View')) {
      throw new Error('You need to install the @adonisjs/view package to use this package.')
    }

    this.$container.with(['Adonis/Core/Application', 'Adonis/Core/View'],
      async (Application: ApplicationContract, View) => {
        try {
          const entrypointsFilePath = Application.publicPath('/build/entrypoints.json')
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
