"use strict";
const gulp = require('gulp');

const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const exec = require('child_process').exec;

const CONFIG = {
    path: {
        ts: {
            src: __dirname + '/src/*.ts',
            dest: __dirname + '/lib'
        }
    }
};


gulp.task('default', ['watch']);

gulp.task('watch', ['ts'], function() {
    gulp.watch(CONFIG.path.ts.src, ['ts']);
});

gulp.task('tsfmt', (callback) => {
    return exec('$(npm bin)/tsfmt -r', (error, stdout, stderr) => {
        if (stdout) console.log(`${stdout}`);
        if (stderr) console.error(`${stderr}`);
        if (error) console.error(`${error}`);
        callback();
    });
});

gulp.task('ts', ["tsfmt"], function () {
    return gulp.src(CONFIG.path.ts.src)
        .pipe(ts(tsProject))
        .pipe(gulp.dest(CONFIG.path.ts.dest));
});
