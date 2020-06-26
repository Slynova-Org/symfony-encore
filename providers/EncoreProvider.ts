import { IocContract } from '@adonisjs/fold'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class EncoreProvider {
  constructor (protected $container: IocContract) {}

  public async boot () {
    if (!this.$container.hasBinding('Adonis/Core/View')) {
      throw new Error('You need to install the @adonisjs/view package to use this package.')
    }

    this.$container.with(['Adonis/Core/Application', 'Adonis/Core/View'], (Application: ApplicationContract, View) => {
      const entrypointsFilePath = Application.publicPath('/build/entrypoints.json')
      const { entrypoints } = require(entrypointsFilePath)

      View.global('encoreLink', (entry: string) => {
        const files = entrypoints[entry]['css']

        return files.map((file: string) => `<link rel="stylesheet" href="${file}">`).join('')
      })

      View.global('encoreScript', (entry: string) => {
        const files = entrypoints[entry]['js']

        return files.map((file: string) => `<script src="${file}" defer></script>`).join('')
      })
    })
  }
}
