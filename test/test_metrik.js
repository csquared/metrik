var spawn  = require('child_process').spawn;
var logfmt = require('logfmt');
var concat = require('concat-stream');
var assert = require('assert');

suite('metrik', function(){
  test('count# gets summed', function(done){
    var metrik = spawn('./bin/metrik');

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

  test('measure# gets n, units, mean, median, perc95, and perc99', function(done){
    var metrik = spawn('./bin/metrik');

    metrik.stdin.write('measure#thing=10ms\n')
    metrik.stdin.write('measure#thing=20ms\n')
    metrik.stdin.write('measure#thing=30ms')
    metrik.stdin.end();

    metrik.stdout.pipe(concat(function(data){
      var logged = logfmt.parse(data.toString());
      assert.equal(logged['metrik'], 'thing')
      assert.equal(logged['n'], '3')
      assert.equal(logged['units'], 'ms')
      assert.equal(logged['mean'], '20')
      assert.equal(logged['median'], '20')
      assert.equal(logged['perc95'], '30')
      assert.equal(logged['perc99'], '30')
      done();
    }))
  })

  test('passes through', function(done){
    var metrik = spawn('./bin/metrik');
    metrik.stdout.pipe(concat(function(data){
      assert.equal("dont fuck with this\n", data.toString())
      done();
    }))

    metrik.stdin.write("dont fuck with this");
    metrik.stdin.end();
  })
})
