import gulp from 'gulp';
import path from 'path';
import del from 'del';
import sequence from 'run-sequence';
import babelCompiler from 'babel-core/register';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();

const paths = {
  src: ['index.js', 'src/**/*.js'],
  files: ['./.env', './Procfile', './.gitignore', './db.js'],
  tests: {
    integration: '.tests/integration/**/*.js',
    unit: '.tests/unit/**/*.js',
  },
  server: './index.js',
  ignore: ['!node_modules/**', '!coverage/**', '!build/**', '!tests/**', '!gulpfile.babel.js'],
  build: 'build',
};

// Explanation for this
const opt = {
  dir: './coverage',
  reporters: ['lcov', 'json', 'text', 'text-summary', 'clover'],
  reportOpts: { dir: './coverage' },
};

gulp.task('help', $.taskListing);

gulp.task('clean', () => del(['build/**', '!build']));

gulp.task('copy', () => {
  gulp.src(paths.files)
    .pipe($.newer(paths.build))
    .pipe(gulp.dest(paths.build));
});

// Explanation for base.
// we are not doing things like concat, minify, uglify why?
gulp.task('babel', () => {
  gulp.src(paths.src, { base: '.' })
    .pipe($.newer(paths.build)) // can this be compared
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.', {
      includeContent: false,
      sourceRoot(file) {
        return path.relative(file.path, __dirname);
      },
    }))
    .pipe(gulp.dest(paths.build));
});

gulp.task('nodemon', ['copy', 'babel'], () => {
  $.nodemon({
    script: path.join(paths.build, 'index.js'),
    env: { NODE_ENV: 'development' },
    ignore: paths.ignore,
    tasks: ['copy', 'babel'],
    watch: [paths.src],
  }).on('restart', () => console.info('Restarting'));
});

// we are testing the already built files?.
// Shouldnt we be using gulp plumber in more places
// I dont see mocha recursive in the npm doc
// wondering if we could use process.exit() instead using a new package for that
// The test needs me to run gulp first before running it
// why no curly brace on finish line
gulp.task('test', () => {
  process.env.NODE_ENV = 'test';

  // Whats in serverTests
  gulp.src(['./build/src/app/**/*.js'])
    .pipe($.plumber())
    .pipe($.istanbul())
    .pipe($.istanbul.hookRequire())
    .on('finish', () => {
      gulp.src([...paths.tests.unit, ...paths.tests.integration])
        .pipe($.mocha({
          reporter: 'spec',
          ui: 'bdd',
          recursive: true,
          compilers: {
            js: babelCompiler,
          },
        }))
        .once('error', (e) => {
          console.info(e);
          process.exit(1);
        })
        .pipe($.istanbul.writeReports(opt))
        .pipe($.istanbul.enforceThresholds({ thresholds: { global: 10 } }))
        .on('end', () => console.info('>>Finished Running Tests'))
        .pipe($.exit());
    });
});

gulp.task('lint', () => {
  gulp.src(['**/*.js', '!node_modules/**'])
    .pipe($.eslint())
    .pipe($.eslint.format());
});

gulp.task('serve', ['clean'], () => sequence('nodemon'));

gulp.task('default', ['clean'], () => {
  sequence(['lint', 'copy', 'babel']);
});
