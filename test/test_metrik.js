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

  test('measure# gets mean', function(done){
    var metrik = spawn('./bin/metrik');

    metrik.stdin.write('measure#thing=10ms\n')
    metrik.stdin.write('measure#thing=20ms\n')
    metrik.stdin.write('measure#thing=30ms')
    metrik.stdin.end();

    metrik.stdout.pipe(concat(function(data){
      var logged = logfmt.parse(data.toString());
      assert.equal(logged['measure#thing.mean'], '20ms')
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
