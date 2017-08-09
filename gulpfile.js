var gulp = require('gulp');

/* ТРАНСПАЙЛИНГ */
var browserify = require('browserify'),
    babelify = require('babelify');

/* УПРАВЛЕНИЕ ПАЙПЛАЙНОМ */
var source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    merge = require('gulp-merge');
    
/* ИЗОБРАЖЕНИЯ */
var imagemin = require('gulp-imagemin'),
    spritesmith = require('gulp.spritesmith');

/* СКРИПТЫ */
var uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps');
    
/* СТИЛИ */
var sass = require('gulp-sass'),
    csso = require('gulp-csso'),
    gcmq = require('gulp-group-css-media-queries');
    prefix = require('gulp-autoprefixer');

/* ПРОЧЕЕ */
var mainBowerFiles = require('main-bower-files'),
    browserSync = require('browser-sync'),
    gulpSequence = require('gulp-sequence');

/* КОНСТАНТЫ */
const PRODUCTION = './public';
const BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

gulp.task('sass', function () {
    return gulp.src('scss/app.scss')
        .pipe(sass())
        .pipe(prefix(BROWSERS))
        .pipe(gcmq())
        .pipe(csso())
        .pipe(gulp.dest(PRODUCTION + '/css'));
});

gulp.task('es6', function() {
    var bundler = browserify({
        entries: ['./es6/app.js'],
        debug: true
    });

    var bundle = function() {
        return bundler
            .transform('babelify', {presets: ['es2015']})
            .bundle()
            .pipe(source('app.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(PRODUCTION + '/js'));
    };
    return bundle();
});

gulp.task('bower-js', function() {
    return gulp.src(mainBowerFiles('**/*.js'))
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(gulp.dest(PRODUCTION + '/js'));
});

gulp.task('bower-css', function() {
    return gulp.src(mainBowerFiles('**/*.css'))
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(PRODUCTION + '/css'));
});

gulp.task('sprites', function (cb) {
    var spriteData = gulp.src('./assets/sprites/*.png')
        .pipe(spritesmith({
            imgName: 'sprites.png',
            cssName: 'sprites.css',
            imgPath: '../assets/sprites.png'
        }));
    
    var imgStream = spriteData.img
        .pipe(buffer())
        .pipe(imagemin({
            optimizationLevel: 3, 
            progressive: true, 
            interlaced: true
        }))
        .pipe(gulp.dest(PRODUCTION + '/assets'));

    var cssStream = spriteData.css
        .pipe(gulp.dest('./scss/run-up'));

    cssStream.on('end', function() {
        cb();
    });
    
    return merge(imgStream, cssStream);
});

gulp.task('sync', function () {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        port: 7000,
        open: false,
        browser: "chrome",
        files: [PRODUCTION + "/css/*.css", 
                PRODUCTION + "/*.html", 
                PRODUCTION + "/js/**/*.js",
                'views/**/*.pug',
                'es6/**/*.js']
    });
});

gulp.task('watch', function () {
    gulp.watch('scss/**/*.scss', {cwd:'./'}, ['sass']);   
    gulp.watch('es6/**/*.js', {cwd:'./'}, ['es6']);
    gulp.watch('assets/sprites/*.png', {cwd:'./'}, ['sprites-sass']);
    gulp.watch('bower_components/**/*.*', {cwd:'./'}, ['bower-js', 'bower-css']);
    gulp.watch('assets/fonts/*.*', {cwd:'./'}, ['copy-fonts']);
    gulp.watch('assets/imgs/*.*', {cwd:'./'}, ['copy-imgs']);
    gulp.watch('assets/*.*', {cwd:'./'}, ['copy-assets']);
});

gulp.task('copy-fonts', function() {
    return gulp.src('./assets/fonts/*.*')
        .pipe(gulp.dest(PRODUCTION + '/assets/fonts'))
});

gulp.task('copy-assets', function() {
    return gulp.src('./assets/*.*')
        .pipe(gulp.dest(PRODUCTION + '/assets'))
});

gulp.task('copy-imgs', function() {
    return gulp.src('./assets/img/*.*')
        .pipe(gulp.dest(PRODUCTION + '/assets/img'))
});

gulp.task('default', ['init', 'watch']);
gulp.task('sprites-sass', gulpSequence('sprites', 'sass'));
gulp.task('init', gulpSequence('sprites-sass', ['bower-js', 'bower-css', 'es6'], ['copy-fonts', 'copy-imgs', 'copy-assets'], 'sync'));
gulp.task('update', ['sprites-sass', 'copy-fonts', 'copy-imgs', 'copy-assets']);

