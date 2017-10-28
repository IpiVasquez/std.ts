let gulp = require('gulp');
let ts = require('gulp-typescript');
let webpack = require('gulp-webpack');
let compress = require('gulp-minify');
let runSeq = require('run-sequence');

let tsProject = ts.createProject('tsconfig.json', {
    // Changes root dir so a new src folder will not be created on ./lib
    rootDir: 'src'
});

gulp.task('default', () => runSeq('ts', 'webpack', 'compress'));

gulp.task('ts', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('lib'));
});

gulp.task('watch', ['ts'], function () {
    gulp.watch('src/**/*.ts', ['ts']);
});

gulp.task('webpack', function () {
    return gulp.src('lib/std.js')
        .pipe(webpack(require('./webpack.config')))
        .pipe(gulp.dest('.'));
});

gulp.task('compress', function () {
    gulp.src('bundle/std.js')
        .pipe(compress({
            ext: {
                src: '.min.js',
                min: '.js'
            }
        }))
        .pipe(gulp.dest('bundle'));
});