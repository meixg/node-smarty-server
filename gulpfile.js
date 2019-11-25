const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', gulp.parallel(['php']), () =>
	gulp.src('src/**/*.ts')
		.pipe(babel())
		.pipe(gulp.dest('dist'))
);

gulp.task('php', () => {
    gulp.src('src/**/*.php')
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => 
	gulp.watch('src/**/*.ts', gulp.series('default'))
)