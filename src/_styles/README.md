# Styles

Our SCSS architecture is heavily inspired by Bootstrap 4 with some minor changes.  This allows us to easily add components styling in an organized way, while leveraging the codebase consistency of a project like Bootstrap.

## Structure

The main entry point for all styling on the site is `_styles/theme.scss`.  Additionally, there is a `checkout.scss` file that runs in place of this file on the checkout pages.

SCSS files are organized as follows:
```
├── checkout/      # Components that only exist on checkout pages
├── components/    # Reusable components
├── core/          # Bootstrap files + add'tl core functionality
├── modules/       # Single purpose elements on the site (non-reuasble)
├── templates/     # Styles specific to a single template or area of the site
├── vendor/        # Third party styles
├── checkout.scss
└── theme.scss
```

If you compare `theme.scss` with the default bootstrap stylesheet ([see here](https://github.com/twbs/bootstrap/blob/master/scss/bootstrap.scss)) you'll notice a lot of similarities.  The project is structured to use bootstrap as the __core__ of the styling and add all additional functionality in more appropriate subdirectories.  With that in mind, all bootstrap files can be found in `_styles/core`.  Some minor adjustments have been made to these core files to better suit our development.  Those adjustments are as follows:

##### Removed Components

The following bootstrap components have been omitted from this project either because we don't need them or we already have an existing component in place.

- Dropdowns
- Input groups
- Nav
- Navbar
- Breadcrumb
- Pagination
- Badge
- Jumbotron
- Progress
- Media
- List Group
- Toasts
- Tooltip
- Popover
- Carousel
- Spinners
- Print

##### Core Modifications

The following changes have been made to the core bootstrap files.  The majority of them are additions as opposed to removals or modifications in order to keep the core functionality consistent with the bootstrap documentation.

- Add type mixins - typography variables have been broken down to each type style (h1, h2, ..p1, p2, ...)
- Remove `$gray` color map and all associated functions.
- Add gray scale colors to the map `$colors` map
- Helper classes file - `core/helpers.scss`
- Add `visually-hidden` and `visually-shown` mixins to `mixins/_visibility.scss`
- Add `core/layout.scss`
- Add component variables to control styling of components _outside_ of core
- Add all transition variables
- Add `mixins/_stretch`
- Add `mixins/_aspect-ratio`
- Add gray + black text utility colors to `utilities/_text.scss`
- Add letter spacing to `utilities/_text.scss`
- Add text transform none to `utilities/_text.scss`
- Add background black to `utilities/_background.scss`
- Add `xxl` breakpoint
- Add extra helper functions to `core/functions.scss`
- Add `$largest-container-width` to variables
- Turn off `$enable-validation-icons`
- Add `.card-header__title` and `.card-header__title-icon` to card styles.
- Add `.card-header__title-icon-trigger`
- Drop `.modal-dialog-centered` class and apply those styles directly to the base modal so modals are vertically ceneterd by default
- Add separate color map for buttons to avoid generating a bunch of extra button styles when using `$theme-colors`
- Add `breakpoint-infix-rear` breakpoint mixin to make generating BEM style classses easier
- Add `$form-check-vertical-spacing` to control spacing between `.form-check` elements
- Add `$custom-control-vertical-spacing` to control spacing between `.custom-control` elements
