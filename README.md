![ZG](https://i.imgur.com/KBnzMey.png)

# Z-Theme

Z-Theme is a boilerplate Shopify theme built on top of [Slate](https://shopify.github.io/slate/docs/0.14.0/).

## Getting Started

- If you're kicking off a new project, follow instructions in [Cloning Z-Theme](https://github.com/zehnergroup/z-theme/wiki/Cloning-Z-Theme)
- Setting up first time? Follow instructions in Dev Environment Setup section below.
- In the project directory, install dependences with `npm install`
- Setup your [shopify dev store](https://partners.shopify.com/489730/stores)
- [Generate API credentials](https://help.shopify.com/api/getting-started/api-credentials#get-credentials-through-the-shopify-admin) for your local environment
- Rename `config.yml.sample` to `config.yml` and add your store information and private app credentials:
  - **store:** the Shopify-specific URL for this store/environment (ie. my-store.myshopify.com)
  - **theme_id:** the unique id for the theme you want to write to when deploying to this store. You can find this information in the URL of the theme's online editor at Shopify [admin/themes](https://shopify.com/admin/themes).
  - **password:** the password generated via a private app on this store.  Access this information on your Shopify [admin/apps/private](https://shopify.com/admin/apps/private) page.
- You're now ready to start building! Follow Z-Theme [dev prep guide](https://github.com/zehnergroup/z-theme/wiki/Dev-Prep-Guide) for next steps.

### [Slate Commands](https://shopify.github.io/slate/docs/0.14.0/commands/)

_Note: there is a [known bug](https://github.com/zehnergroup/z-theme/issues/348) (and temporary solve) with `vendor.js` when deploying to a new theme._

```bash
slate start [-e][-m] # Runs build, deploy, then watcher
slate watch [-e][-n] # Runs watcher, then deploy
slate deploy [-e][-m] # Builds `dist` folder and replaces the theme set in config.yml
slate build # Creates a production-ready `dist` bundle
slate zip # Creates a zip file for manually uploading your theme
slate -h # Help
```

### NPM Scripts

```bash
npm run start # Installs Slate globally and locally to start working on any project.
npm run hooks # Installs a Git Hook that prevents branch changes without stopping the watcher (sets a touch -a to the config.yml to force the watcher stop)
npm run start-dev # Runs the `gulp start` task which runs all gulp tasks and then starts a watcher
npm run build # Runs the `gulp build` task which compiles scss and javascript in production mode (minification enabled)
```

##### Gulp Tasks

All gulp tasks can be found in the `gulp/tasks` directory.  You can run them independently at any time with `gulp {{ task_name }}`.

All task configuration can be found in `gulp/config.js`.  This config defines the various tasks and the filepatterns, input and output directories associated with each of them.

**Note:** For the `scripts` and `styles` tasks, there are multiple entry points as we need a few different files for different parts of the site (or different layouts).  Inside the config you'll notice that some of the files / bundles entries have been commented out, leaving only one enabled at a time, this is a fix to make the build more efficient.  By watching one file at a time, Slate will only upload one file at a time on change.  For instance, if we leave all main entry point JS files (checkout, theme, vendor) un-commented, then Slate will re-upload 3 files everytime anything in the `_scripts` directory changes.  Typically we only need to work on one of these files at a time (i.e. theme and checkout are used mutually exclusively) so commenting out is not a problem.

##### Underscored Directories

This project uses Slate behind the scenes to handle file changes and uploads.  It comes with a watcher that watches over files inside of two specific source directories titles `styles` and `scripts`.  This watcher runs a task every time files are changed that re-compiles any top-level files and moves them into the `dist` directory for uploading.  This works well except for the fact that it compiles and uploads _all_ of those top level files each time anything changes.  For example, because we have 4 JS files, this means we have to wait for 4 files to upload everytime we make a change to one.  To get around this, we put our styles and scripts in directories with _underscore prefixes_ and hook them up to our own gulp watch task that compiles and outputs them directly to the `dist/assets` directory (which uploads single files on change).

### Starting Development

Development requires 2 terminal processes, one for slate and one for gulp.  To get started:

- Open up one terminal window and run `slate watch`.
- Next, open up another window and `npm run start-dev`, this will run the scripts and styles task as well as start the non-slate watcher on files in these directories.
- To make sure things are working correctly, edit a SCSS file, the gulp task should run and then the slate watcher should upload the file immediately after.

If javascript bundling is running slow, remove the eslint task from the default watcher.  The actual browserify bundling is relatively fast, code minifation and linting takes significantly longer.

By default, the `start-dev` npm script will run some gulp tasks in development mode which will turn off code minifying to decrease build time.  When deploying to a live site, be sure to run `npm run build` before uploading all the files as this task will rebuild scripts and styles with minification enabled.

##### Additional documentation

- For script documentation, please see the README file inside `src/_scripts`
- See the [wiki](https://github.com/zehnergroup/z-theme/wiki) for more general information related to the project, as well as any gotchas or engineering recipes.

## Theme Features

Use this area of the readme to document anything specific related to the theme's interaction with products, collection, blogs, settings, etc.

### Product

##### Metafields
| Namespace | Key | Description |
|---|---|---|
| `namespace_here` | `key_here` | Description of what should go in this metafield and how it is used. |

##### Tags

| Value | Effect |
|---|---|
| Tag Name | Description of tag and how it is used |

### CMS Pages

The following pages utilize the CMS page schema and renderer.  Any time changes are made to the schema, make sure to update the schemas on all of the following sections to ensure the full suite of modules is always available.

- `page-cms.liquid`

### Checkout Additional Scripts

Since additional checkout scripts are saved in a textarea inside the checkout admin settings, they do not have versioning and are liable to be modified or removed at any time.  As a precaution, try to store the most up to date version of these scripts inside the snippet `_checkout-additional-scripts.liquid`.  This file doesn't get included on the site anywhere but is the only way to keep this content in version control.




## Local Environment Setup

- Using [NVM](https://github.com/nvm-sh/nvm#install--update-script), install Node v8.2.1: `nvm install 8.2.1 && nvm use 8.2.1`
- Install Slate & Gulp globally: `npm i -g gulp@3.9.1 && npm i -g @shopify/slate`
- Verify your installs using `nvm list`, `gulp -v`, `slate -v`

## Code Editor Setup

- [`.editorconfig`](https://editorconfig.org/#download)
- [Prettier](https://prettier.io/docs/en/editors.html)

### [VS Code](https://code.visualstudio.com/)

_`v2`: open your Command Palette, and search for `Show Recommended Extensions`_.

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Shopify Liquid Template Snippets](https://marketplace.visualstudio.com/items?itemName=killalau.vscode-liquid-snippets)
- [Liquid Languages Support](https://marketplace.visualstudio.com/items?itemName=neilding.language-liquid)
- [Sass](https://marketplace.visualstudio.com/items?itemName=robinbentley.sass-indented)
- [Color Highlight](https://marketplace.visualstudio.com/items?itemName=naumovs.color-highlight)
- [Settings Sync](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync)

#### Enable 'Format on Save'

- `v2`: open your Command Palette, and search for `Open Settings (JSON)`, ensure that 'Format on Save' is set to `true`:
```
"editor.formatOnSave": true,
```




