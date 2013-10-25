var logfmt = require('logfmt');
var through = require('through');
var split = require('split');

var counts = {};
var metrikFilter = through(function(_line){
  var line = _line.split(']:').slice(1).join()
  var data = logfmt.parse(line);
  var keys = Object.keys(data);
  var hasMetrics = false;

  //compute metrics on lines w. metrics
  for(var i in keys){
    var key = keys[i];
    if(/^count#/.test(key)){
      hasMetrics = true;
      counts[key] = counts[key] || 0;
      counts[key] += parseInt(data[key]);
    }
  }

  //send lines w.o metrics through the pipe
  if(!hasMetrics){
    this.queue(_line + "\n")
  }
})

var flushMetrics = function(){
  logfmt.log(counts)
  counts = {}
}

process.stdin
  .pipe(split())
  .pipe(metrikFilter)
  .pipe(process.stdout)
process.on('exit', flushMetrics)

var interval = setInterval(flushMetrics, 5000)
process.stdin.on('close', function(){
  clearInterval(interval);
  process.exit(0);
})
