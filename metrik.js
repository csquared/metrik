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

function mean(array){
  var n = array.length;
  var sum = _.reduce(array,
      function(memo, num){ return memo + num; }, 0);
  return sum / n;
}

function perc95(array){
  var n = array.length;
  var last_n = Math.floor(n / 100) * 5;
  if(last_n === 0) last_n = 1;
  return mean(array.slice(array.length - last_n));
}

function perc99(array){
  var n = array.length;
  var last_n = Math.floor(n / 100);
  if(last_n === 0) last_n = 1;
  return mean(array.slice(array.length - last_n));
}

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
      var sorted = _.sortBy(measures[key], function(v) { return v })
      var data = {}
      data.metrik = key.replace('measure#','')
      data.n = n
      if(units) data.units = units
      data.mean = mean(measures[key]);
      data.median = sorted[Math.floor(n/2)];
      data.perc95 = perc95(sorted);
      data.perc99 = perc99(sorted);
      if(argv.precision){
        if(data.mean) data.mean = data.mean.toFixed(argv.precision)
        if(data.median) data.median = data.median.toFixed(argv.precision)
        if(data.perc95) data.perc95 = data.perc95.toFixed(argv.precision)
        if(data.perc99) data.perc99 = data.perc99.toFixed(argv.precision)
      }
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
