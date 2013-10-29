var logfmt  = require('logfmt');
var through = require('through');
var split   = require('split');
var argv    = require('optimist').argv;
var _       = require('underscore')

var stats   = require('./stats')
stats.precision = argv.p || argv.precision;
stats.separator = argv.s || argv.separator;

var counts = {};
var measures = {};
var MAX_SAMPLES = 1000;

var metrikFilter = through(function(line){
  var hasMetrics = false;
  if(/(count|measure)#/.test(line)){
    //hack to get the leading BS out of the line
    if(/\[[\w\.]+\]\:/.test(line)){
      line = line.split(']:').slice(1).join()
    }
    var data = logfmt.parse(line);
    var keys = Object.keys(data);

    //add metrics to hashes
    for(var i in keys){
      var key = keys[i];
      if(/count#/.test(key)){
        hasMetrics = true;
        counts[key] = counts[key] || {}
        data[key]   = parseInt(data[key]) + (counts[key][key] || 0)
        counts[key] = data
      }

      if((argv.histo || argv.avg) && /measure#/.test(key)){
        var number = parseFloat(data[key])
        if(isNaN(number)) {
          hasMetrics = false;
          continue;
        }
        measures[key] = measures[key] || []
        hasMetrics = true;
        var units  = data[key].match(/[a-zA-Z]+$/)
        if(units) measures[key].units = units[0]
        measures[key].push(number)
        measures[key].source = data.source
      }
    }
  }

  //send lines w.o metrics through the pipe
  if(!hasMetrics){
    this.queue(line + "\n")
  }
})

var flushMetrics = function(){
  if(Object.keys(counts).length > 0){
    for(var key in counts){
      logfmt.log(counts[key])
    }
  }
  counts = {}

  if(Object.keys(measures).length > 0){
    for(var key in measures){
      if(!measures[key]) continue;
      if(measures[key].length === 0) continue;
      if(argv.histo){ logfmt.log(stats.histo_measures(measures, argv.histo)); }
      if(argv.avg) { logfmt.log(stats.sample_measures(measures)); }
      if(measures[key].length > MAX_SAMPLES) measures[key] = null;
    }
  }
}

process.stdin
  .pipe(split())
  .pipe(metrikFilter)
  .pipe(process.stdout)

process.on('SIGINT', flushMetrics)
process.on('exit', flushMetrics)

var i = parseInt(argv.i || argv.interval || 5) * 1000;
var interval = setInterval(flushMetrics, i)
process.stdin.on('close', function(){
  clearInterval(interval);
  process.exit(0);
})
