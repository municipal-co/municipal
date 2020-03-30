# JavaScript

Our javascript architecture takes inspiration from Slate, but refactored and modernized to better fit our workflow.  This allows us to easily add functionality in an organized way that focuses on re-usability of modules and share-ability of utilities.

- [Structure](#structure)
- [Adding JavaScript](#adding-javascript)
- [JavaScript Conventions](#javascript-conventions)
- [Adding A Section](#adding-a-section)
- [Removing A Section](#removing-a-section)
- [Adding Vendor Libraries](#adding-vendor-libraries)
- [Using React](#using-react)

## Structure

The main entry point for all scripts on the site is `_scripts/theme.js`.  This file imports all global dependencies, registers all sections and kicks off any code that needs to run across across the entire site.  Only add code to this file if it is _absolutely necessary_, see the section below for information on how to classify the any javascript you need to add.

##### Additional script files

By default, the gulp development task _only_ watches this theme.js file as this is the main file.  There are additional script files in the project that serve specific purposes.  Edit the `gulp/config.js` to enable these file for watching / compilation during development if needed.  In general, it is best to only watch one file at a time, otherwise the Slate watcher deploy takes long as it has to upload additional files with each save.

- `checkout.js` - This script is included in `layout/checkout.liquid` and contains code specific to the checkout pages.
- `vendor.js` - This script includes any libraries that need to be loaded _before_ the opening body tag.  They are pulled in via a regular script tag (non defer) so try to keep this as light weight as possible.  Currently, only Modernizr is included as it needs to apply feature-support classes to the document before rendering the page.  If your script doesn't have a reason to be in here, it probably doesn't need to be.

## Adding JavaScript

When adding javascript to the theme, you need to determine the purpose of the script and how it will be used, this will determine where it should live.  Here is a brief explanation of the script subdirectories.

- __Core__ - Core functionality that is used across all pages on the site.  Typically these files contain helper functions, API shortcuts and commons variables.
- __Lib__ - Any useful functionality that serves a specific purpose but is not related to core site feature set.
- __Managers__ - Singletons that manage multiple instances of functionality.  They can be imported and used in any file.
- __Models__ - Classes that don't fall into any other subdirectory
- __Sections__ - Scripts that map to files in `src/sections`
- __Templates__ - If you need to run javascript on a specific template.  Better to use sections if possible.
- __UI__ - Modules that exist on multiple pages and represent a unit of UI (i.e. dropdown, popup, etc..).
- __View__ - Functionality specific to an area of the site (isn't shared across different pages).

__Note:__ If writing something global that is independent of a module, then write it inside of `theme.js`.  Examples of this could be scrolling effects, analytics, user cookies, etc..

##### Note On Section Events

Section events aren't covered very clearly in the official documentation.  If you browse the [Shopify documentation on sections](https://help.shopify.com/en/themes/development/sections) and scroll all the way to the bottom, you'll see a section about how the Theme Editor API works.

> When merchants customize sections, the HTML of those sections is dynamically added, removed, or re-rendered directly onto the existing DOM without reloading the entire page.
> JavaScript that runs when the page loads will not run again when a section is re-rendered or added to the page.

To make sure your theme sections don't break when the user is customizing the theme, the editor fires events that your code can respond to. The events listed in the Shopify docs are the raw events as fired by the theme editor.

The __SectionManager__ class provides acts as an abstraction layer to make it easier to interact with these events.  It takes care of attaching event listeners and calling the appropriate handlers.  As long as you follow the javascript pattern for sections (see [Adding A Section](#adding-a-section)), all you need to do is attach specifically named methods to the class and the __SectionManager__ object will handle the rest.  The full list of named methods that you can use are listed at the bottom of the [Slate JavaScript documentation](https://shopify.github.io/slate/docs/0.14.0/js-examples/) and duplicated below.

| Methods      | Description |
| :-------------- | :-------------- |
| `onUnload()`        | A section has been deleted or is being re-rendered. |
| `onSelect()`        | User has selected the section in the editor's sidebar. |
| `onDeselect()`      | User has deselected the section in the editor's sidebar. |
| `onReorder()`       | User has changed the section's order in the editor's sidebar. |
| `onBlockSelect()`   | User has selected the block in the editor's sidebar. |
| `onBlockDeselect()` | User has deselected the block in the editor's sidebar. |


## JavaScript Conventions

When adding javascript code to the theme, please keep the following code conventions in mind.

- All code should be camelcased except class definitions which should be Pascal cased.

  ```javascript
  // Pascal cased class definition
  class MyClass {

  }

  // Camel case everywhere else
  const myClassInstance = new MyClass();
  ```

- Utilities use named exports.
- Selectors use `data-*` attributes and should be defined outside any constructors.
- Document your code as neccessary, this includes following [JSDocs](http://usejsdoc.org/) guidelines to define function signatures if they accept arguments, return values, or both.
- Prefix any private methods with an underscore.
- For consistency, when querying the DOM with a scoping element, pass it to the $ constructor as the second argument.  This makes it easier to read what is being selected.

  ```javascript
  // Do this
  const $el = $(selector, $parentScope);

  // Not this
  const $el = $parentScope.find(selector);
  ```

##### Code Linting
Additionally, this project comes with ESlint installed to lint files for common errors and code style.  All settings are contained within the `.eslintrc` file at the project root.  The linter settings extend from the airbnb preset as that has become a javascript standard.  All rule settings specified in this file either turn off or lower the warning level for rules contained in this preset.

If you are running the watcher during development, the gulp linting task should run every time you save a file.  If you aren't, you can always run it independently with

```shell
>> gulp eslint
```

## Adding A Section

When adding a new section to the site, there are a couple things that you must do to get it working properly.  The javascript structure requires specific naming conventions for any section code you write.  Any time you build a new section, there are 3 files that you must create or modify.

For the sake of the following example code, lets assume we're building a section for an **About Us** page.

##### Section Template

The template that you create for your section can have whatever you want inside of it.  The only thing that must be present for your section code to run properly is a wrapper element with a `data-section-type` attribute.  The value should match the name of the liquid file.  Make note of it because you will need it to register your section in `theme.js` (see below).

```liquid
<!-- sections/about-us.liquid -->

<div data-section-type="about-us">
  <!-- Section liquid code here -->
</div>
```

##### Section Script

When adding section javascript, take extra care to make sure that it is fully compatible with the theme editor API.  The following guidelines will help you build your section javascript correctly.  For reference, see [the following slate documentation](https://shopify.github.io/slate/docs/0.14.0/js-examples/#section-events).

- The code structure requires that you attach a constructor to `window.theme` which can then be passed into `slate.Sections`.
- You should declare any selectors needed by that section outside of the constructor.
- Attach all methods to the object's prototype (unless they need private variable access).
- The constructor and object key should both be Pascal Cased.
- The constructor *must* accept an `HTMLElement` as it's only argument to be compatible with `slate.Sections`.  Make sure you look through the source code for this object, especially the `register` method as that is the on that we'll be using to intialize our section.

A simple example would look like:

```javascript
// _scripts/sections/aboutUs.js

import $ from 'jquery';
import BaseSection from './base';

// Place all selectors at the top of this file
// These should almost always be data-attributes (to keep css classes strictly presentational) that describe the elements they select
const selectors = {
  aboutButton: '[data-about-button]',
  listItem: '[data-list-item]'
};

// Place all css classes at the top of this file that get used in functions down below.
// These are typically used to represent the different element states
const classes = {
  isActive: 'is-active'
};

// Make sure the class is the default export
export default class AboutUsSection extends BaseSection {
  // @param {HTMLElement} container - Wrapper element from the section liquid file, it scopes all other DOM elements.
  constructor(container) {
    super(container, 'aboutUs'); // Call the parent constructor first to set base instance variables, namespaces should be camelCased.

    // For any DOM elements that can be cached (don't change over the life of the page or there's a small number of them)
    // set them as instance variables
    this.$aboutButton = $(selectors.aboutButton, this.$container);

    // Handler functions should be named " 'on' + selectorName + eventName "
    // Cached elements get bound directly
    // Non-cached elements get bound using delegated handlers - see below for usage
    this.$aboutButton.on('click', this.onAboutButtonClick.bind(this));
    this.$container.on('click', selectors.listItem, this.onListItemClick.bind(this));
  }

  _privateFunction() {
    //
  }

  onAboutButtonClick(e) {
    e.preventDefault();
    //
  }

  onListItemClick(e) {
    var $listItem = $(e.currentTarget);

    // Use the clicked on $listItem here
  }

  // Any methods that apply *only* to the theme editor should go at the bottom of the file (see _scripts/sections/sectionManager.js)
  onSelect() {
    //
  }
}
```

##### Theme Script

```javascript
// _scripts/theme.js

// Import the section along with all the other section imports

// Sections
import AboutUsSection from './sections/aboutUs';


// Register your section after all the other calls to sections.register
sections.register('about-us', AboutUsSection);
```

## Removing A Section

If you remove a section from your theme, be sure to remove the file and all the javascript associated with it.  Continuing with our **About Us** example:

- Remove `sections/about-us.liquid`
- Remove `_scripts/sections/aboutUs.js`
- Remove the related lines in `theme.js`

```javascript
// Remove this line
import AboutUsSection from './sections/aboutUs';

// And this one
sections.register('about-us', AboutUsSection);
```

## Adding Vendor Libraries

All vendor libraries should be installed through NPM when possible and directly imported into whatever script file requires them.  For jQuery plugins, include them at the top of `_scripts/theme.js` below the initial jQuery import, this will attach them to the global instance of jQuery that is specified through the browserify shim (see package.json).  If you need to include a library that isn't CommonJS compatible, add it to the `browserify-shim` property of `package.json`, this will tell Browserify how to resolve it when importing it.  See the [browserify-shim README.md](https://www.npmjs.com/package/browserify-shim) for full details.

## Using React

There are only a few steps needed to get React running on this project.

First you'll need to install React and React DOM as project dependencies.

```
npm install react react-dom --save
```

Next, you'll need to include the Babel React preset so that browserify can handle JSX syntax.

To do this, install the dependency

```
npm install @babel/preset-react --save-dev
```

and then include it in the gulp script task when specifying Babelify options.

```javascript
b.transform(babelify, {
    presets: ["@babel/preset-env", "@babel/preset-react"], // <- Add this preset
    ignore: [
      "./node_modules/",
      "../../node_modules/"
    ]
  });
```

Now you can create React components and include them on the page using React DOM.  This might look something like...

```javascript
// _scripts/reactComponents/test.js

import React from 'react';

class TestComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clicks: 0 }
  }

  handleClick() {
    this.setState(prevState => ({
      clicks: prevState.clicks + 1
    }));
  }

  render() {
    return (
      <div style={ {textAlign: 'center'} }>
        <p>Test Component</p>
        <button onClick={ this.handleClick.bind(this) }>Clicked {this.state.clicks} Times</button>
      </div>
    );
  }
}
```

```javascript
// _scripts/sections/mySection.js

import React from 'react';
import ReactDOM from 'react-dom';
import BaseSection from './base';
import TestComponent from '../reactComponents/test';

export default class MySection extends BaseSection {
  constructor(container) {
    super(container, 'mySection');

    ReactDOM.render(<TestComponent />, document.getElementById('test-container'));
  }
}
```

*Note:* You may have to adjust some eslint settings as JSX code will break some of the linter rules that are included by default.
