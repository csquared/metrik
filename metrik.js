var logfmt  = require('logfmt');
var through = require('through');
var split   = require('split');
var argv    = require('optimist').argv;

var counts = {};
var metrikFilter = through(function(line){
  //hack to get the leading BS out of the line
  if(/\]\:/.test(line)){
    line = line.split(']:').slice(1).join()
  }

  var hasMetrics = false;
  if(/count#/.test(line)){
    hasMetrics = true;
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
