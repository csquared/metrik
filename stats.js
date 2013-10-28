var logfmt = require('logfmt');
var _       = require('underscore')

exports.mean = function mean(array){
  var n = array.length;
  var sum = _.reduce(array,
      function(memo, num){ return memo + num; }, 0);
  return sum / n;
}

exports.perc95 = function perc95(array){
  var n = array.length;
  var last_n = Math.floor(n / 100) * 5;
  if(last_n === 0) last_n = 1;
  return exports.mean(array.slice(array.length - last_n));
}

exports.perc99 = function perc99(array){
  var n = array.length;
  var last_n = Math.floor(n / 100);
  if(last_n === 0) last_n = 1;
  return exports.mean(array.slice(array.length - last_n));
}


exports.counts = function(counts){
  if(Object.keys(counts).length > 0){
    for(var key in counts){
      //counts[key].metrik = key.replace('count#','')
      logfmt.log(counts[key])
    }
  }
}

exports.measures = function(measures){
  if(Object.keys(measures).length > 0){
    for(var key in measures){
      var n = measures[key].length
      var units = measures[key].units
      var sorted = _.sortBy(measures[key], function(v) { return v })
      var data = {}
      data.metrik = key.replace('measure#','')
      data.n = n
      if(units) data.units = units
      data.mean = exports.mean(measures[key]);
      data.median = sorted[Math.floor(n/2)];
      data.perc95 = exports.perc95(sorted);
      data.perc99 = exports.perc99(sorted);
      var precision = exports.precision;
      if(precision){
        if(data.mean) data.mean = data.mean.toFixed(precision)
        if(data.median) data.median = data.median.toFixed(precision)
        if(data.perc95) data.perc95 = data.perc95.toFixed(precision)
        if(data.perc99) data.perc99 = data.perc99.toFixed(precision)
      }
      if(measures[key].source) data.source = measures[key].source;
      logfmt.log(data)
      if(n > 100) measures[key] = [];
    }
  }
}
