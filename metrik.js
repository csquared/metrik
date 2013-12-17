var argv    = require('optimist').argv;
var split   = require('split');
var through = require('through');

var f = filters = require('./filters');

var compressCounts  = argv.c || argv.count
var compressMeasure = argv.m || argv.measure
var stripHeroku     = argv.s || argv.strip

//add newlines back from split
var newLines = through(function(line){
  if(!line) return;
  this.queue(line.replace(/\n$/,'') + "\n")
})

var thisPipe = process.stdin.pipe(split())
if(stripHeroku)     thisPipe = thisPipe.pipe(f.herokuFilter);
if(compressCounts)  thisPipe = thisPipe.pipe(f.countFilter);
if(compressMeasure) thisPipe = thisPipe.pipe(f.measureFilter);
thisPipe.pipe(newLines).pipe(process.stdout)

var flushMetrics = function(){
  filters.flush(process.stdout);
}

process.on('SIGINT', flushMetrics)
process.on('exit', flushMetrics)

var i = parseInt(argv.i || argv.interval || 5) * 1000;
var interval = setInterval(flushMetrics, i)
process.stdin.on('close', function(){
  clearInterval(interval);
  process.exit(0);
})
