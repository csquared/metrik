var spawn  = require('child_process').spawn;
var logfmt = require('logfmt');
var concat = require('concat-stream');
var assert = require('assert');

suite('metrik', function(){
  test('sums counts', function(done){
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
