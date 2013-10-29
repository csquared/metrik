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
  var top_5 = array.length - Math.ceil(array.length * 0.05) - 1;
  return array[top_5];
}

exports.perc99 = function perc99(array){
  var n = array.length;
  var top_99 = array.length - Math.ceil(array.length * 0.01) - 1;
  return array[top_99];
}

exports.sample_measures = function(measures){
  if(Object.keys(measures).length > 0){
    for(var key in measures){
      var separator = exports.separator || '.'
      var n = measures[key].length
      var units = measures[key].units
      var sorted = _.sortBy(measures[key], function(v) { return v })
      var data = {}
      var metrik = key.replace(/^measure#/,'sample#') + separator
      if(units) data.units = units
      var precision = exports.precision || 10;
      data[metrik + 'mean']   = exports.mean(measures[key]);
      data[metrik + 'median'] = sorted[Math.floor(n/2)];
      data[metrik + 'perc95'] = exports.perc95(sorted);
      data[metrik + 'perc99'] = exports.perc99(sorted);
      if(measures[key].source) data.source = measures[key].source;
      data.now = (new Date()).getTime();
      data.n = n
      data.type = 'avg'
      return data;
    }
  }
}

exports.histo = function(array, bins){
  if(!bins) throw new Error("No bins");
  var sorted = _.sortBy(array, function(v) { return v })
  var buckets = [];
  var n = sorted.length;
  var width = n / bins;
  for(var i=0; i<n; i++){
    var bin = Math.floor(i / width);
    buckets[bin] = buckets[bin] || [];
    buckets[bin].push(sorted[i]);
  }
  for(var i=0; i<buckets.length; i++){
    buckets[i] = exports.mean(buckets[i])
  }
  return buckets;
}

exports.histo_measures = function(measures, bins){
  if(Object.keys(measures).length > 0){
    for(var key in measures){
      var separator = exports.separator || '.'
      var n = measures[key].length
      var units = measures[key].units
      var data = {}
      var metrik = key.replace(/^measure#/,'sample#') + separator
      var bins = bins || 5;
      if(bins > n) bins = n;
      var histo = exports.histo(measures[key], bins);
      for(var i=0; i<histo.length; i++){
        data[metrik + 'bin' + (i+1)] = histo[i]
      }

      if(measures[key].source) data.source = measures[key].source;
      data.now = (new Date()).getTime();
      data.n = n
      data.units = units;
      data.type = 'histo'
      logfmt.log(data)
    }
  }
}
