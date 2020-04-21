const 

    // development mode?
    devBuild = (process.env.NODE_ENV !== 'production'),

    // modules
    gulp = require('gulp'),
    noop = require('gulp-noop'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    htmlclean = require('gulp-htmlclean'),
    concat = require('gulp-concat'),
    deporder = require('gulp-deporder'),
    terser = require('gulp-terser'),
    stripdebug = devBuild ? null : require('gulp-strip-debug'),
    sourcemaps = devBuild ? require('gulp-sourcemaps') : null,
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    assets = require('postcss-assets'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    cssnano = require('cssnano'),
    browserSync = require('browser-sync').create();


    // folders
    src = 'src/',
    build = 'build/';
    
    // image processing
    function images() {

        const out = build + 'images/';
    
        return gulp.src(src + 'images/**/*')
        .pipe(newer(out))
        .pipe(imagemin({ optimizationLevel: 5 }))
        .pipe(gulp.dest(out));
    
    };
    exports.images = images;

    // HTML processing
    function html() {
        const out = build;
    
        return gulp.src(src + 'html/**/*')
        .pipe(newer(out))
        .pipe(devBuild ? noop() : htmlclean())
        .pipe(gulp.dest(out));
    }
    exports.html = gulp.series(images, html);

    // JavaScript processing
    function js() {

        return gulp.src(src + 'js/**/*')
        .pipe(sourcemaps ? sourcemaps.init() : noop())
        .pipe(deporder())
        .pipe(concat('scripts.js'))
        .pipe(stripdebug ? stripdebug() : noop())
        .pipe(terser())
        .pipe(sourcemaps ? sourcemaps.write() : noop())
        .pipe(gulp.dest(build + 'js/'));
    
    }
    exports.js = js;

    // CSS processing
    function css() {

        return gulp.src(src + 'scss/styles.scss')
        .pipe(sourcemaps ? sourcemaps.init() : noop())
        .pipe(sass({
            outputStyle: 'nested',
            imagePath: '/images/',
            precision: 3,
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(postcss([
            assets({ loadPaths: ['images/'] }),
            autoprefixer({ BrowsersList: ['last 2 versions', '> 2%'] }),
            //mqpacker
            //cssnano
        ]))
        .pipe(sourcemaps ? sourcemaps.write() : noop())
        .pipe(gulp.dest(build + 'css/'));
    
    }
    exports.css = gulp.series(images, css);

    // A browserSync task to reload the page
    function reload() {
        browserSync.reload();
    }

    // run all tasks
    exports.build = gulp.parallel(exports.html, exports.css, exports.js);

    // watch for file changes
    function watch(done) {

        // browserSync
        browserSync.init({
            server: {
                baseDir: "./build"
            }
        });

        // image changes
        gulp.watch(src + 'images/**/*', images).on('change', browserSync.reload);
    
        // html changes
        gulp.watch(src + 'html/**/*', html).on('change', browserSync.reload);
    
        // css changes
        gulp.watch(src + 'scss/**/*', css).on('change', browserSync.reload);
    
        // js changes
        gulp.watch(src + 'js/**/*', js).on('change', browserSync.reload);
    
        done();
    
    }
    exports.watch = watch;

    // default task
    exports.default = gulp.series(exports.build, exports.watch);