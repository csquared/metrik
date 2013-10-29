var spawn  = require('child_process').spawn;
var logfmt = require('logfmt');
var concat = require('concat-stream');
var assert = require('assert');
var stats  = require('../stats')

suite('stats', function(){
  test('perc95 and perc99 w. n=100', function(){
    var array = []
    for(var i = 0; i < 100; i++){
      array[i] = i;
    }
    var result = stats.perc95(array);
    assert.equal(94, result);
  })

  test('histo w. n=100', function(){
    var array = []
    for(var i = 0; i < 100; i++){
      array[i] = i+1;
    }
    var histo = stats.histo(array, 5);
    assert.equal(10.5, histo[0]);
    assert.equal(30.5, histo[1]);
    assert.equal(50.5, histo[2]);
    assert.equal(70.5, histo[3]);
    assert.equal(90.5, histo[4]);
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
