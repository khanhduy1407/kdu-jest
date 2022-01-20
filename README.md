# kdu-jest

Jest Kdu transformer with source map support

> **NOTE:** This is documentation for `kdu-jest@3.x`.

## Usage

```bash
npm install --save-dev kdu-jest
```

## Setup

To define `kdu-jest` as a transformer for your `.kdu` files, map them to the `kdu-jest` module:

```json
{
  "jest": {
    "transform": {
      "^.+\\.kdu$": "kdu-jest"
    }
}
```

A full config will look like this.

```json
{
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "kdu"
    ],
    "transform": {
      "^.+\\.js$": "babel-jest",
      "^.+\\.kdu$": "kdu-jest"
    }
  }
}
```

If you're on a version of Jest older than 22.4.0, you need to set `mapCoverage` to `true` in order to use source maps.

## Supported langs

kdu-jest compiles the script and template of SFCs into a JavaScript file that Jest can run. **Currently, SCSS, SASS and Stylus are the only style languages that are compiled**.

### Supported script languages

- **typescript** (`lang="ts"`, `lang="typescript"`)
- **coffeescript** (`lang="coffee"`, `lang="coffeescript"`)

### Global Jest options

You can change the behavior of `kdu-jest` by using `jest.globals`.

> *Tip:* Need programmatic configuration? Use the [--config](https://jestjs.io/docs/en/cli.html#config-path) option in Jest CLI, and export a `.js` file

#### babelConfig

Provide `babelConfig` in one of the following formats:

- `<Boolean>`
- `<Object>`
- `<String>`

##### Boolean

- `true` - Enable Babel processing. `kdu-jest` will try to find Babel configuration using [find-babel-config](https://www.npmjs.com/package/find-babel-config).

> This is the default behavior if [babelConfig](#babelconfig) is not defined.

- `false` - Skip Babel processing entirely:

```json
{
  "jest": {
    "globals": {
      "kdu-jest": {
        "babelConfig": false
      }
    }
  }
}
```

##### Object

Provide inline [Babel options](https://babeljs.io/docs/en/options):

```json
{
  "jest": {
    "globals": {
      "kdu-jest": {
        "babelConfig": {
          "presets": [
            [
              "env",
              {
                "useBuiltIns": "entry",
                "shippedProposals": true
              }
            ]
          ],
          "plugins": [
            "syntax-dynamic-import"
          ],
          "env": {
            "test": {
              "plugins": [
                "dynamic-import-node"
              ]
            }
          }
        }
      }
    }
  }
}
```

##### String

If a string is provided, it will be an assumed path to a babel configuration file (e.g. `.babelrc`, `.babelrc.js`).
- Config file should export a Babel configuration object.
- Should *not* point to a [project-wide configuration file (babel.config.js)](https://babeljs.io/docs/en/config-files#project-wide-configuration), which exports a function.

```json
{
  "jest": {
    "globals": {
      "kdu-jest": {
        "babelConfig": "path/to/.babelrc.js"
      }
    }
  }
}
```

To use the [Config Function API](https://babeljs.io/docs/en/config-files#config-function-api), use inline options instead. i.e.:

```json
{
  "jest": {
    "globals": {
      "kdu-jest": {
        "babelConfig": {
          "configFile": "path/to/babel.config.js"
        }
      }
    }
  }
}
```

#### tsConfig

Provide `tsConfig` in one of the following formats:

- `<Boolean>`
- `<Object>`
- `<String>`

##### Boolean

- `true` - Process TypeScript files using custom configuration. `kdu-jest` will try to find TypeScript configuration using [tsconfig.loadSync](https://www.npmjs.com/package/tsconfig#api).

> This is the default behavior if [tsConfig](#tsConfig) is not defined.

- `false` - Process TypeScript files using the [default configuration provided by kdu-jest](https://github.com/khanhduy1407/kdu-jest/blob/master/lib/load-typescript-config.js#L5-L27).

##### Object

Provide inline [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html):

```json
{
  "jest": {
    "globals": {
      "kdu-jest": {
        "tsConfig": {
          "importHelpers": true
        }
      }
    }
  }
}
```

##### String

If a string is provided, it will be an assumed path to a TypeScript configuration file:

```json
{
  "jest": {
    "globals": {
      "kdu-jest": {
        "tsConfig": "path/to/tsconfig.json"
      }
    }
  }
}
```

### Supported template languages

- **pug** (`lang="pug"`)
  - To give options for the Pug compiler, enter them into the Jest configuration.
  The options will be passed to pug.compile().

  ```json
    {
      "jest": {
        "globals": {
          "kdu-jest": {
            "pug": {
              "basedir": "mybasedir"
            }
          }
        }
      }
    }
  ```

- **jade** (`lang="jade"`)
- **haml** (`lang="haml"`)

### Supported style languages

- **stylus** (`lang="stylus"`, `lang="styl"`)
- **sass** (`lang="sass"`)
  - The SASS compiler supports jest's [moduleNameMapper](https://facebook.github.io/jest/docs/en/configuration.html#modulenamemapper-object-string-string) which is the suggested way of dealing with Webpack aliases.
- **scss** (`lang="scss"`)
  - The SCSS compiler supports jest's [moduleNameMapper](https://facebook.github.io/jest/docs/en/configuration.html#modulenamemapper-object-string-string) which is the suggested way of dealing with Webpack aliases.
  - To import globally included files (ie. variables, mixins, etc.), include them in the Jest configuration at `jest.globals['kdu-jest'].resources.scss`:

    ```json
    {
      "jest": {
        "globals": {
          "kdu-jest": {
            "resources": {
              "scss": [
                "./node_modules/package/_mixins.scss",
                "./src/assets/css/globals.scss"
              ]
            }
          }
        }
      }
    }
    ```
- **postcss** (`lang="pcss"`, `lang="postcss"`)

## CSS options

`experimentalCSSCompile`: `Boolean` Default true. Turn off CSS compilation
`hideStyleWarn`: `Boolean` Default false. Hide warnings about CSS compilation
`resources`:

  ```json
  {
    "jest": {
      "globals": {
        "kdu-jest": {
          "hideStyleWarn": true,
          "experimentalCSSCompile": true
        }
      }
    }
  }
  ```
