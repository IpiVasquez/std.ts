let gulp = require('gulp');
let ts = require('gulp-typescript');
let tsLint = require('gulp-tslint');
let webpack = require('webpack-stream');
let compress = require('gulp-minify');
let runSeq = require('run-sequence');

gulp.task('default', () => runSeq('ts', 'webpack', 'compress'));

gulp.task('ts', function () {
    let tsProject = ts.createProject('./tsconfig.json', {
        // Changes root dir so a new src folder will not be created on ./lib
        rootDir: './src'
    });

    let tsResult = gulp.src('./src/**/*.ts').pipe(tsProject());
    tsResult.js.pipe(gulp.dest('lib'));
    tsResult.dts.pipe(gulp.dest('types'));
});

gulp.task('lint', function () {
    // noinspection JSUnresolvedFunction
    gulp.src(['./src/**/*.ts', './test/**/*.ts'])
        .pipe(tsLint())
        .pipe(tsLint.report());
});

gulp.task('watch', ['ts'], function () {
    gulp.watch('./src/**/*.ts', ['ts']);
});

gulp.task('webpack', function () {
    return gulp.src('./lib/maths.js')
        .pipe(webpack(require('./webpack.config')))
        .pipe(gulp.dest('.'));
});

gulp.task('compress', function () {
    gulp.src('./bundle/maths.js')
        .pipe(compress({
            ext: {
                src: '.min.js',
                min: '.js'
            }
        }))
        .pipe(gulp.dest('./bundle'));
});
