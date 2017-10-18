var tsconfig = require('./tsconfig.json');

module.exports = function (grunt) {
    "use strict";

    //noinspection JSUnresolvedFunction
    grunt.initConfig({
        ts: {
            default: {
                files: [{
                    src: ["./src/\*\*/\*.ts"],
                    dest: tsconfig.compilerOptions.outDir
                }],
                options: {
                    target: tsconfig.compilerOptions.target,
                    sourceMap: tsconfig.compilerOptions.sourceMap,
                    declaration: tsconfig.compilerOptions.declaration,
                    rootDir: './src/',
                    removeComments: false
                }
            },
            dev: {
                files: [{
                    src: ["./src/\*\*/\*.ts"],
                    dest: tsconfig.compilerOptions.outDir
                }],
                options: {
                    target: tsconfig.compilerOptions.target,
                    sourceMap: tsconfig.compilerOptions.sourceMap,
                    declaration: tsconfig.compilerOptions.declaration,
                    rootDir: './src/',
                    removeComments: false
                },
                watch: './src/'
            }
        },
        exec: {
            webpack: "./node_modules/.bin/webpack",
            minify: "./node_modules/.bin/minify bundle/ -c"
        }
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-exec");

    grunt.registerTask("default", [
        "ts:default",
        "exec"
    ]);

};
