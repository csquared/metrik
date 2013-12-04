var eep     = require('eep');
var logfmt  = require('logfmt');


// Alternatively, use a composite aggregate function
var _stats = [
  eep.Stats.count, eep.Stats.sum, eep.Stats.min, eep.Stats.max,
  eep.Stats.mean, eep.Stats.vars, eep.Stats.stdevs
];
var headers = [ 'count', 'sum', 'min', 'max', 'mean', 'variance', 'stdev' ];

var createTumbler = function createTumbler(name, size){
  // Create a composite function tumbling window
  var tumbling = eep.EventWorld.make().windows().tumbling(new eep.CompositeFunction(_stats), size);

  // Register callback(s)
  tumbling.on('emit', function(values) {
    var data = {};
    for (var i in values) {
      var key = name.replace('measure#', 'sample#') + '.' + headers[i];
      data[key] = values[i];
    }
    logfmt.log(data);
  });

  return tumbling;
}

module.exports.createTumbler = createTumbler;

var tumblers = {};
module.exports.tumblers = tumblers;;
module.exports.defaultSize = 20;
module.exports.push = function(key, number, size) {
  size = size || module.exports.defaultSize;
  tumblers[key] = tumblers[key] || createTumbler(key, size);
  tumblers[key].enqueue(number);
}

exports.counts = function(counts){
  if(Object.keys(counts).length > 0){
    for(var key in counts){
      //counts[key].metrik = key.replace('count#','')
      logfmt.log(counts[key])
    }
  }
}
