module.exports = {
  root: {
    src: './src'
  },
  tasks: {
    styles: {
      // Relative to root.src
      src: '/_styles',
      dest: '../dist/assets',
      filePattern: ['src/_styles/**/*.scss'],
      files: ['theme.scss'],
      // files: ['checkout.scss'],
      // files: ['theme.scss', 'checkout.scss'],
      watchTask: 'styles',
      extensions: ['scss', 'css']
    },
    scripts: {
      src: '/_scripts',
      dest: '../dist/assets',
      extensions: ['js'],
      bundles: [{
        entries: 'theme.js',
        outputName: 'theme.js'
      }]
      // bundles: [{
      //   entries: 'theme.js',
      //   outputName: 'theme.js'
      // }, {
      //   entries: 'vendor.js',
      //   outputName: 'vendor.js'    
      // }]      
      // bundles: [{
      //   entries: 'theme.js',
      //   outputName: 'theme.js'
      // }, {
      //   entries: 'vendor.js',
      //   outputName: 'vendor.js'
      // }, {
      //   entries: 'checkout.js',
      //   outputName: 'checkout.js'
      // }]
    },
    eslint: {
      filePattern: ['gulpfile.js/**/*.js', 'src/_scripts/**/*.js'],
      extensions: ['js']
    }
  }
};
