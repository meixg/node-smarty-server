const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('php', () => {
    return gulp.src('src/**/*.php')
        .pipe(gulp.dest('dist'));
});

gulp.task('ts', () =>
	gulp.src('src/**/*.ts')
		.pipe(babel())
		.pipe(gulp.dest('dist'))
);

gulp.task('default', gulp.parallel(['php', 'ts']));

gulp.task('watch', () =>
	gulp.watch(['src/**/*.ts', 'src/**/*.php'], gulp.series('default'))
);

gulp.task('dev', gulp.series('default', 'watch'));