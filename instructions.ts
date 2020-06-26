import { join } from 'path'
import * as sinkStatic from '@adonisjs/sink'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Prompt choices for the frontend framework selection
 */
const JS_PROMPT_CHOICES = [
  {
    name: 'vue' as const,
    message: 'Vue',
    hint: ' (Install the vue-loader)',
  },
  {
    name: 'react' as const,
    message: 'React',
    hint: ' (Install Babel React Preset)',
  },
  {
    name: 'none' as const,
    message: 'None',
    hint: '',
  },
]

/**
 * Prompt choices for the frontend CSS system selection
 */
const CSS_PROMPT_CHOICES = [
  {
    name: 'sass' as const,
    message: 'Sass / Scss',
    hint: ' (Install the sass-loader)',
  },
  {
    name: 'less' as const,
    message: 'LESS',
    hint: ' (Install the less-loader)',
  },
  {
    name: 'stylus' as const,
    message: 'Stylus',
    hint: ' (Install the stylus-loader)',
  },
  {
    name: 'none' as const,
    message: 'None',
    hint: '',
  },
]

function getFrontendFramework (sink: typeof sinkStatic) {
  return sink.getPrompt().choice('Which frontend framework do you want to use?', JS_PROMPT_CHOICES)
}

function getCssLang (sink: typeof sinkStatic) {
  return sink.getPrompt().choice('Which CSS language do you want to use?', CSS_PROMPT_CHOICES)
}

/**
 * Returns absolute path to the stub relative from the templates
 * directory
 */
function getStub (...relativePaths: string[]) {
  return join(__dirname, 'templates', ...relativePaths)
}

/**
 * Instructions to be executed when setting up the package.
 */
export default async function instructions (
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic,
) {
  const frontendFramework = await getFrontendFramework(sink)
  const cssLang = await getCssLang(sink)
  const typescript = await sink.getPrompt().confirm('Do you want to use TypeScript?')
  const postCss = await sink.getPrompt().confirm('Do you want to use PostCSS?')

  const pkg = new sink.files.PackageJsonFile(projectRoot)

  switch (frontendFramework) {
    case 'vue': {
      pkg.install('vue-loader', undefined, true)
      pkg.install('vue', undefined, true)
      break
    }
    case 'react': {
      pkg.install('@babel/preset-react', undefined, true)
      pkg.install('react', undefined, true)
      pkg.install('react-dom', undefined, true)
      pkg.install('prop-types', undefined, true)
      break
    }
    default: {}
  }

  switch (cssLang) {
    case 'sass': {
      pkg.install('sass-loader', undefined, true)
      pkg.install('sass', undefined, true)
      break
    }
    case 'less': {
      pkg.install('less-loader', undefined, true)
      break
    }
    case 'stylus': {
      pkg.install('stylus-loader', undefined, true)
      break
    }
    default: {}
  }

  if (postCss) {
    pkg.install('postcss-loader', undefined, true)
    pkg.install('autoprefixer', undefined, true)
    pkg.set('browserslist', [
      '> 0.5%',
      'last 2 versions',
      'Firefox ESR',
      'not dead',
    ])

    sink.utils.copyFiles(join(__dirname, 'templates'), projectRoot, ['postcss.config.js'])
  }

  if (typescript) {
    pkg.install('ts-loader', undefined, true)
    sink.utils.copyFiles(join(__dirname, 'templates'), app.resourcesPath('ts'), ['tsconfig.json'])
  }

  /**
   * Scripts to run encore
   */
  pkg.appendScript('build:front', 'npx encore dev --watch')
  pkg.appendScript('build:front:prod', 'NODE_ENV=production npx encore production')

  /**
   * Copy webpack config file
   */
  const configPath = join(projectRoot, 'webpack.config.js')
  const webpackConfig = new sink.files.MustacheFile(projectRoot, configPath, getStub('webpack.config.txt'))
  webpackConfig.apply({
    typescript,
    postCss,
    jsFile: typescript ? 'ts' : 'js',
    cssFile: cssLang,
    sass: cssLang === 'sass',
    less: cssLang === 'less',
    stylus: cssLang === 'stylus',
    react: frontendFramework === 'react',
    vue: frontendFramework === 'vue',
  }).commit()
  sink.logger.create(configPath)

  const cssFilePath = app.resourcesPath(`${cssLang}/app.${cssLang}`)
  const cssFile = new sink.files.MustacheFile(projectRoot, cssFilePath, getStub('app.txt'))
  cssFile.apply({
    lang: cssLang,
  }).commit()
  sink.logger.create(cssFilePath)

  const jsFilePath = app.resourcesPath(`${typescript ? 'ts' : 'js'}/app.${typescript ? 'ts' : 'js'}`)
  const jsFile = new sink.files.MustacheFile(projectRoot, jsFilePath, getStub('app.txt'))
  jsFile.apply({
    lang: typescript ? 'TypeScript' : 'JavaScript',
  }).commit()
  sink.logger.create(jsFilePath)

  pkg.install('@symfony/webpack-encore', undefined, true)
  pkg.install('webpack-notifier', undefined, true)

  /**
   * Install required dependencies
   */
  sink.logger.info(`Installing packages: ${pkg.getInstalls().list.join(', ')}...`)

  await pkg.commitAsync()

  sink.logger.success('Packages installed!')

  /**
   * Usage instructions
   */
  console.log(' ')
  console.log(`   ${sink.colors.gray('$')} Run ${sink.colors.cyan('npm run build:front')} to start the build`)
  console.log(`   ${sink.colors.gray('$')} Run ${sink.colors.cyan('npm run build:front:prod')} to build for production`)
}
