import { join } from 'path'
import * as sinkStatic from '@adonisjs/sink'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Instructions to be executed when setting up the package.
 */
export default async function instructions (
  projectRoot: string,
  _: ApplicationContract,
  sink: typeof sinkStatic,
) {
  const pkg = new sink.files.PackageJsonFile(projectRoot)

  /**
   * Scripts to run encore
   */
  pkg.appendScript('build:front', 'npx encore dev --watch')
  pkg.appendScript('build:front:prod', 'NODE_ENV=production npx encore production')

  /**
   * Copy webpack config file
   */
  sink.utils.copyFiles(join(__dirname, 'templates'), projectRoot, ['webpack.config.js'])

  /**
   * Install required dependencies
   */
  sink.logger.info('Installing "@symfony/webpack-encore" and "webpack-notifier"...')

  pkg.install('@symfony/webpack-encore', undefined, true)
  pkg.install('webpack-notifier', undefined, true)
  await pkg.commitAsync()

  sink.logger.success('Packages installed!')

  /**
   * Usage instructions
   */
  console.log(' ')
  console.log(`   ${sink.colors.gray('$')} Run ${sink.colors.cyan('npm run build:front')} to start the build`)
  console.log(`   ${sink.colors.gray('$')} Run ${sink.colors.cyan('npm run build:front:prod')} to build for production`)
}
