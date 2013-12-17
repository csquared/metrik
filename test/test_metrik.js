var spawn  = require('child_process').spawn;
var logfmt = require('logfmt');
var concat = require('concat-stream');
var assert = require('assert');

suite('metrik', function(){
  test('count# gets summed', function(done){
    var metrik = spawn('./bin/metrik', ['-c']);

    metrik.stdout.pipe(concat(function(data){
      var logged = logfmt.parse(data.toString());
      assert.equal(logged['count#thing'], 29)
      done();
    }))

    metrik.stdin.write('count#thing=10\n')
    metrik.stdin.write('count#thing=9\n')
    metrik.stdin.write('count#thing=10')
    metrik.stdin.end();
  })

  test('measure# gets count, sum, min, max, mean, variance, and stdev', function(done){
    var metrik = spawn('./bin/metrik', ['-m']);

    for(var i=0; i<20; i++){
      metrik.stdin.write('measure#thing=10ms\n')
      metrik.stdin.write('measure#thing=20ms\n')
      metrik.stdin.write('measure#thing=30ms\n')
      metrik.stdin.write('measure#thing=10ms\n')
      metrik.stdin.write('measure#thing=20ms\n')
      metrik.stdin.write('measure#thing=30ms\n')
    }
    metrik.stdin.end();

    metrik.stdout.pipe(concat(function(data){
      data = data.toString().replace("\n",'');
      var logged = logfmt.parse(data);
      assert.equal(logged['sample#thing.count'], '20')
      assert.equal(logged['sample#thing.sum'], '410')
      assert.equal(logged['sample#thing.min'], '10')
      assert.equal(logged['sample#thing.max'], '30')
      assert.equal(logged['sample#thing.mean'], '20.5')
      assert.equal(logged['sample#thing.variance'], '68.15789473684211')
      assert.equal(logged['sample#thing.stdev'], '8.255779474818965')
      done();
    }))
  })

  /*
  test('measure# gets n, units, mean, median, perc95, and perc99', function(done){
    var metrik = spawn('./bin/metrik');

    metrik.stdin.write('measure#thing=10ms\n')
    metrik.stdin.write('measure#thing=20ms\n')
    metrik.stdin.write('measure#thing=30ms\n')
    metrik.stdin.write('measure#thing=10ms\n')
    metrik.stdin.write('measure#thing=20ms\n')
    metrik.stdin.write('measure#thing=30ms')
    metrik.stdin.end();

    metrik.stdout.pipe(concat(function(data){
      var logged = logfmt.parse(data.toString());
      assert.equal(logged['n'], '6')
      assert.equal(logged['units'], 'ms')
      assert.equal(logged['sample#thing.mean'],   '20')
      assert.equal(logged['sample#thing.median'], '20')
      assert.equal(logged['sample#thing.perc95'], '30')
      assert.equal(logged['sample#thing.perc99'], '30')
      done();
    }))
  })
  */

  test('passes through', function(done){
    var metrik = spawn('./bin/metrik');
    metrik.stdout.pipe(concat(function(data){
      assert.equal("dont fuck with this\n", data.toString())
      done();
    }))

    metrik.stdin.write("dont fuck with this\n");
    metrik.stdin.end();
  })
})
