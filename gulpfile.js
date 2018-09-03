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
// var cssnano = require('gulp-cssnano');
// var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cleancss = require('gulp-clean-css');


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
        .pipe(plumber())
        // .pipe(uglify()) todo
        .pipe(gulp.dest(config.build_dir + config.scripts_dir))
});

gulp.task('styles', function() {
    gulp.src([config.source_dir + config.styles_dir + '[^_]*.{scss,css}'])
    // gulp.src(config.source_dir + config.scss_files)
        .pipe(plumber())
        .pipe(sass(eyeglass()))
        .pipe(autoprefixer())
        // .pipe(sass({outputStyle: 'compressed'}))
        // .pipe(rename({ suffix: '.min'}))
        .pipe(cleancss())
        .pipe(gulp.dest(config.build_dir + config.styles_dir))
        .pipe(duration('Compiling scss'))
});

// Templating and JSON data
gulp.task('templates', function() {
    return gulp.src([config.source_dir + config.templates_dir + '*.+(html|nunjucks)'])
        .pipe(data(function() {
            return JSON.parse(fs.readFileSync('source/templates/data/data.json'))
        }))
        .pipe(nunjucksRender({
            path: [config.source_dir + config.templates_dir],
            envOptions: {autoescape: false}
        }))
        .pipe(gulp.dest(config.build_dir))
        // .pipe(browserSync.reload({
        //     stream: true
        // }))
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
        config.build_dir + '**/*',
    ]);
});

gulp.task('default', ['watch', 'styles', 'scripts', 'templates', 'browserSync']);
