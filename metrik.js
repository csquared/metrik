var logfmt  = require('logfmt');
var through = require('through');
var split   = require('split');
var argv    = require('optimist').argv;
var _       = require('underscore')

var counts = {};
var measures = {};
var metrikFilter = through(function(line){
  var hasMetrics = false;
  if(/(count|measure)#/.test(line)){
    hasMetrics = true;
    //hack to get the leading BS out of the line
    if(/\]\:/.test(line)){
      line = line.split(']:').slice(1).join()
    }
    var data = logfmt.parse(line);
    var keys = Object.keys(data);

    //compute metrics on lines w. metrics
    for(var i in keys){
      var key = keys[i];
      if(/count#/.test(key)){
        counts[key] = counts[key] || {}
        data[key]   = parseInt(data[key]) + (counts[key][key] || 0)
        counts[key] = data
      }

      if(/measure#/.test(key)){
        measures[key] = measures[key] || []
        var number = parseFloat(data[key])
        var units  = data[key].replace(number,'')
        measures[key].push(number)
        measures[key].units = units
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
    counts = {}
  }

  if(Object.keys(measures).length > 0){
    for(var key in measures){
      var n = measures[key].length
      var units = measures[key].units
      var sum = _.reduce(measures[key], function(memo, num){ return memo + num; }, 0);
      var mean = sum / n;
      var mean_key = key + '.mean'
      var data = {}
      data[mean_key] = mean + units;
      if(measures[key].source) data.source = measures[key].source;
      logfmt.log(data)
      if(n > 100) measures[key] = [];
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
