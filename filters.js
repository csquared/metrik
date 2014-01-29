var through = require('through');
var through = require('through');
var split   = require('split');
var _       = require('underscore')

var stats = require('./stats');
var counts = {};
var measures = {};

exports.herokuFilter = through(function(line){
  if(!line) return;
  if(/\[[\w\.]+\]\:/.test(line)){
    this.queue(line.split(']:').slice(1).join())
  }else{
    this.queue(line)
  }
})

exports.setDefaultSize = function setDefaultSize(size){
  stats.defaultSize = size;
  return this;
}

exports.countFilter = through(function(line){
  if(!line) return;
  if(/count#/.test(line)){
    hasMetrics = true;
    var data = logfmt.parse(line);
    var keys = Object.keys(data);

    //add metrics to hashes
    for(var i in keys){
      var key = keys[i];
      if(/count#/.test(key)){
        counts[key] = counts[key] || {}
        data[key]   = parseInt(data[key]) + (counts[key][key] || 0)
        counts[key] = data
      }
    }
  }else{
    this.queue(line)
  }
})

exports.measureFilter = through(function(line){
  if(!line) return;
  if(/measure#/.test(line)){
    var data = logfmt.parse(line);
    var keys = Object.keys(data);

    //add metrics to hashes
    for(var i in keys){
      var key = keys[i];
      if(/measure#/.test(key)){
        measures[key] = measures[key] || []
        var number = parseFloat(data[key])
        var units  = data[key].match(/[a-zA-Z]+$/)
        if(units) measures[key].units = units[0]
        measures[key].push(number)
        measures[key].source = data.source
        stats.push(key, number);
        stats.meta(key, 'source', data.source);
      }
    }
  }else{
    this.queue(line)
  }
})

exports.flush = function flush(stream){
  stats.counts(counts, stream);
  counts = {}
}
