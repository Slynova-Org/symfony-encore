# AdonisJS - Symfony Encore

This package wraps [Symfony Encore](https://symfony.com/doc/current/frontend.html) to make it work seamlessly with AdonisJS.

## Getting Started

This package is available in the npm registry. It can easily be installed with `npm` or `yarn`.

```bash
$ npm i @slynova/symfony-encore
# or
$ yarn add @slynova/symfony-encore
```

Then, you need to scaffold the package using the `node ace invoke` command.

```bash
$ node ace invoke @slynova/symfony-encore
```

Doing so will install `@symfony/webpack-encore` directly in your application, create a boilerplate configuration and setup few scripts in your `package.json` to build your assets.

## How to Use

After tweaking the configuration [according to the documentation](https://symfony.com/doc/current/frontend.html), you can use the two helpers `encoreLink` and `encoreScript` in your Edge templates.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    {{-- Styling --}}
    {{{ encoreLink('css/app') }}}

    {{-- Scripting --}}
    {{{ encoreScript('js/app') }}}
  </head>
  <body>
    {{-- .... --}}
  </body>
</html>
```

The parameter given to those helpers is the entry path you gave in your configuration.

## Roadmap

- Improve the scaffolding process to ask questions about preference (SCSS, TypeScript, PostCSS, etc.) and create a custom config
- Add support for integrity
- Add support to desactivate defered script
