var spawn  = require('child_process').spawn;
var logfmt = require('logfmt');
var concat = require('concat-stream');
var assert = require('assert');
var stats  = require('../stats')

/*
suite('stats', function(){
  test('perc95 and perc99 w. n=100', function(){
    var array = []
    for(var i = 0; i < 100; i++){
      array[i] = i;
    }
    var result = stats.perc95(array);
    assert.equal(94, result);
  })
})

suite('metrik math', function(){
  test('perc95 and perc99 w. n=100', function(done){
    var metrik = spawn('./bin/metrik');

    for(var i=0; i < 100; i++){
      metrik.stdin.write('measure#thing=' + i + '\n')
    }
    metrik.stdin.end();

    metrik.stdout.pipe(concat(function(data){
      data = data.toString().replace("\n",'');
      var logged = logfmt.parse(data);
      assert.equal(logged['sample#thing.perc95'], '94')
      assert.equal(logged['sample#thing.perc99'], '98')
      assert.equal(logged['n'], '100')
      done();
    }))
  })

  test('perc95 and perc99 w. n=1000', function(done){
    var metrik = spawn('./bin/metrik');

    for(var j=0; j<10; j++){
      for(var i=0; i < 100; i++){
        metrik.stdin.write('measure#thing=' + i + '\n')
      }
    }
    metrik.stdin.end();

    metrik.stdout.pipe(concat(function(data){
      data = data.toString().replace("\n",'');
      var logged = logfmt.parse(data);
      assert.equal(logged['sample#thing.perc95'], '94')
      assert.equal(logged['sample#thing.perc99'], '98')
      assert.equal(logged['n'], '1000')
      done();
    }))
  })
})
*/
