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
  pkg.install('webpack-notifier', undefined, true)

  pkg.appendScript('build:front', 'npx encore dev --watch')
  pkg.appendScript('build:front:prod', 'NODE_ENV=production npx encore production')

  const configPath = join(__dirname, 'templates', 'webpack.config.js')
  const template = new sink.files.TemplateLiteralFile(projectRoot, 'webpack.config.js', configPath)
  template.apply().commit()
  sink.logger.create('webpack.config.js')

  sink.logger.info('Installing "@symfony/webpack-encore" and "webpack-notifier"...')
  await pkg.commitAsync()
  sink.logger.success('Packages installed!')

  console.log(`   ${sink.colors.gray('$')} Run ${sink.colors.cyan(`npm run build:front`)} to start the build`)
  console.log(`   ${sink.colors.gray('$')} Run ${sink.colors.cyan(`npm run build:front:prod`)} to build for production`)
}
