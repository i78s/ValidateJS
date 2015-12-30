var gulp = require('gulp');
var path = require('path');

var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var exec = require('child_process').exec;

var CONFIG = {
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

gulp.task('tsconfig', function (callback) {
    return exec('$(npm bin)/tsconfig -u', (error, stdout, stderr) => {
        if (stdout) console.log(`${stdout}`);
        if (stderr) console.error(`${stderr}`);
        if (error) console.error(`${error}`);
        callback();
    });
});

gulp.task('tsfmt', ["tsconfig"], (callback) => {
    return exec('$(npm bin)/tsfmt -r', (error, stdout, stderr) => {
        if (stdout) console.log(`${stdout}`);
        if (stderr) console.error(`${stderr}`);
        if (error) console.error(`${error}`);
        callback();
    });
});

gulp.task('ts', ["tsfmt", "tsconfig"], function () {
    return gulp.src(CONFIG.path.ts.src)
        .pipe(ts(tsProject))
        .pipe(gulp.dest(CONFIG.path.ts.dest));
});
