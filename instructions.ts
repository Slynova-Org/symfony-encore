import { join } from 'path'
import * as sinkStatic from '@adonisjs/sink'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Instructions to be executed when setting up the package.
 */
export default async function instructions (
  projectRoot: string,
  _app: ApplicationContract,
  sink: typeof sinkStatic,
) {
  const pkg = new sink.files.PackageJsonFile(projectRoot)
  pkg.install('@symfony/webpack-encore', undefined, true)
  const configPath = join(__dirname, 'templates', 'webpack.config.js')

  const template = new sink.files.TemplateLiteralFile(projectRoot, 'webpack.config.js', configPath)
  template.apply().commit()
  sink.logger.create('webpack.config.js')

  sink.logger.info('Installing @symfony/webpack-encore')
  await pkg.commitAsync()
  sink.logger.success('Packages installed!')
}
