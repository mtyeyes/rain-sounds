const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const minifyInline = require('gulp-minify-inline');
const del = require("del");
const terser = require("gulp-terser");
const header = require("gulp-header");
const compilationTime = new Date();

const html = () => {
  return gulp.src("source/index.html")
  .pipe(minifyInline())
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"));
};

exports.html = html;

const manifest = () => {
  return gulp.src("source/manifest.json")
  .pipe(gulp.dest("build"));
};

exports.manifest = manifest;

const clean = () => {
  return del("build");
};

exports.clean = clean;

const script = () => {
  return gulp.src("source/script.js", {
    base: "source"
  })
  .pipe(terser())
  .pipe(gulp.dest("build"));
};

exports.script = script;

const worker = () => {
  return gulp.src("source/service-worker.js", {
    base: "source"
  })
  .pipe(header("const uniqueSN='" + compilationTime.getMonth() + compilationTime.getDate() + compilationTime.getHours() + Math.floor(Math.random()*100) + "';"))
  .pipe(terser())
  .pipe(gulp.dest("build"));
};

exports.worker = worker;

const copy = () => {
  return gulp.src([
    "source/*.png",
    "source/*.ico",
    "source/assets/*.*",
    "!source/*.js"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
};

exports.copy = copy;

exports.default = gulp.series(
  clean,
  gulp.parallel(
    copy,
    html,
    script,
    worker,
    manifest,
  ),
);
