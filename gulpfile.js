var gulp = require('gulp');
var nunjucks = require('nunjucks');
var del = require('del');
var data = require('gulp-data');
var browserSync = require('browser-sync').create();
var nunjucksRender = require('gulp-nunjucks-render');
var fs = require("fs");
var duration = require('gulp-duration');
var eyeglass = require("eyeglass");
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cleancss = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var sourcemaps = require('gulp-sourcemaps');
var mode = require('gulp-mode')();
var htmlreplace = require('gulp-html-replace');

// Paths
var config = {
    source_dir : 'source/',
    build_dir : 'build/',
    templates_dir : 'templates/',
    styles_dir : 'styles/',
    data_dir : 'data/',
    scripts_dir : 'scripts/'
};

// Scripts
gulp.task('scripts',function(){
    gulp.src([config.source_dir + config.scripts_dir + '[^_]*.js'])
        .pipe(mode.development(sourcemaps.init()))
        .pipe(plumber())
        .pipe(mode.development(sourcemaps.write('.')))
        // uglify and rename JS in production mode only
        .pipe(mode.production(uglify()))
        .pipe(mode.production(rename({ suffix: '.min' })))
        .pipe(gulp.dest(config.build_dir + config.scripts_dir))
});

gulp.task('styles', function() {
    gulp.src([config.source_dir + config.styles_dir + '[^_]*.{scss,css}'])
        .pipe(mode.development(sourcemaps.init()))
        .pipe(plumber())
        .pipe(sass(eyeglass()))
        .pipe(autoprefixer())
        .pipe(mode.development(sourcemaps.write('.')))
        // minify and rename CSS in production mode only
        .pipe(mode.production(cleancss()))
        .pipe(mode.production(rename({ suffix: '.min' })))
        .pipe(gulp.dest(config.build_dir + config.styles_dir))
        .pipe(duration('Compiling scss'))
});

// Templates and JSON data
gulp.task('templates', function() {
    return gulp.src([config.source_dir + config.templates_dir + '*.+(html|nunjucks)'])
        .pipe(data(function() {
            return JSON.parse(fs.readFileSync('source/templates/data/data.json'))
        }))
        .pipe(nunjucksRender({
            path: [config.source_dir + config.templates_dir],
            envOptions: {autoescape: false}
        }))
        // replace css and js names with .min in production mode
        .pipe(mode.production(htmlreplace({
            'css': 'styles/style.min.css',
            'js': 'scripts/script.min.js',
        })))
        .pipe(mode.production(htmlmin({collapseWhitespace: true, removeComments: true})))
        .pipe(gulp.dest(config.build_dir))
});

gulp.task('browserSync', function() {
    browserSync.init([
        config.build_dir + config.styles_dir + '*.css',
        config.build_dir + '*.html',
        config.build_dir + config.scripts_dir + '**/*.js' ], {
        port: 8080,
        server: {
            baseDir: config.build_dir
        }
    });
});

// Watchers files for changes
gulp.task('watch', function() {
    gulp.watch(config.source_dir + config.styles_dir + '**/*.scss', ['styles']);
    gulp.watch(config.source_dir + config.scripts_dir + '**/*.js', ['scripts']);
    gulp.watch([
        config.source_dir + config.templates_dir + '**/*.+(html|nunjucks)',
        config.source_dir + config.templates_dir + '**/*',
        config.source_dir + config.data_dir + 'data.json'
    ], ['templates']);
});

// Clean build directory
gulp.task('clean', function () {
    return del.sync([
        config.build_dir + '**/*'
    ]);
});

// Development task ($ gulp devel)
gulp.task('devel', ['watch', 'styles', 'scripts', 'templates', 'browserSync']);

// Production task ($ gulp build --production)
gulp.task('build', ['clean', 'styles', 'scripts', 'templates']);


