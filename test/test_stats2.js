var spawn  = require('child_process').spawn;
var logfmt = require('logfmt');
var concat = require('concat-stream');
var assert = require('assert');
var stats2 = require('../stats2');

suite('eep', function(){
  test('does not log before defaultSize samples', function(done){
    var metrik = spawn('./bin/metrik');

    for(var i=0; i < stats2.defaultSize-1; i++){
      metrik.stdin.write('measure#thing=' + i + '\n')
    }
    metrik.stdin.end();

    metrik.stdout.pipe(concat(function(data){
      data = data.toString().replace("\n",'');
      assert.equal('', data);
      done();
    }))
  })

  test('log data at defaultSize samples', function(done){
    var metrik = spawn('./bin/metrik');

    for(var i=0; i < stats2.defaultSize; i++){
      metrik.stdin.write('measure#thing=' + i + '\n')
    }
    metrik.stdin.end();

    metrik.stdout.pipe(concat(function(data){
      data = data.toString().replace("\n",'');
      var logged = logfmt.parse(data);
      assert.equal(logged['sample#thing.sum'], '190')
      assert.equal(logged['sample#thing.count'], '20')
      assert.equal(logged['sample#thing.min'], '0')
      assert.equal(logged['sample#thing.max'], '19')
      assert.equal(logged['sample#thing.mean'], '9.5')
      assert.equal(logged['sample#thing.variance'], '35')
      assert.equal(logged['sample#thing.stdev'], '5.916079783099616' )
      done();
    }))
  })
})

