'use strict';
var concat = require('concat-stream');
var dateFormat = require('dateformat');
var expect = require('chai').expect;
var fs = require('fs');
var spawn = require('child_process').spawn;

var cliPath = './cli.js';
var commitsPath = 'test/fixtures/commits.ldjson';
var optionsPath = 'test/fixtures/options.js';
var contextPath = 'test/fixtures/context.json';

describe('cli', function() {
  it('should work without context and options', function(done) {
    var cp = spawn(cliPath, [commitsPath], {
      stdio: [process.stdin, null, null]
    });
    cp.stdout
      .pipe(concat(function(chunk) {
        expect(chunk.toString()).to.equal('<a name=""></a>\n#  (' + dateFormat(new Date(), 'yyyy-mm-dd', true) + ')\n\n\n### Features\n\n* **ngMessages:** provide support for dynamic message resolution 9b1aff9, closes #10036 #9338\n\n\n### BREAKING CHANGES\n\n* The &#x60;ngMessagesInclude&#x60; attribute is now its own directive and that must be placed as a **child** element within the element with the ngMessages directive.\n\n\n\n');
        done();
      }));
  });

  it('should take context', function(done) {
    var cp = spawn(cliPath, ['-c', contextPath, commitsPath], {
      stdio: [process.stdin, null, null]
    });
    cp.stdout
      .pipe(concat(function(chunk) {
        var log = chunk.toString();
        expect(log).to.contain('This is a title');
        expect(log).to.contain('2015 March 14');
        done();
      }));
  });

  it('should take options', function(done) {
    var cp = spawn(cliPath, ['-o', optionsPath, commitsPath], {
      stdio: [process.stdin, null, null]
    });
    cp.stdout
      .pipe(concat(function(chunk) {
        expect(chunk.toString()).to.equal('template');
        done();
      }));
  });

  it('should take both context and options', function(done) {
    var cp = spawn(cliPath, ['-o', optionsPath, '-c', contextPath, commitsPath], {
      stdio: [process.stdin, null, null]
    });
    cp.stdout
      .pipe(concat(function(chunk) {
        expect(chunk.toString()).to.equal('dodge date :D\ntemplate');
        done();
      }));
  });

  it('should work if it is not tty', function(done) {
    var cp = spawn(cliPath, ['-o', optionsPath, '-c', contextPath], {
      stdio: [fs.openSync(commitsPath, 'r'), null, null]
    });
    cp.stdout
      .pipe(concat(function(chunk) {
        expect(chunk.toString()).to.equal('dodge date :D\ntemplate');
        done();
      }));
  });

  it('should error when there is no commit input', function(done) {
    var cp = spawn(cliPath, {
      stdio: [process.stdin, null, null]
    });
    cp.stderr
      .pipe(concat(function(err) {
        expect(err.toString()).to.equal('You must specify at least one line delimited json file\n');
        done();
      }));
  });

  it('should error when options file doesnt exist', function(done) {
    var cp = spawn(cliPath, ['-o', 'nofile'], {
      stdio: [process.stdin, null, null]
    });
    cp.stderr
      .pipe(concat(function(err) {
        expect(err.toString()).to.contain('Failed to get options from file nofile\n');
        done();
      }));
  });

  it('should error when context file doesnt exist', function(done) {
    var cp = spawn(cliPath, ['--context', 'nofile'], {
      stdio: [process.stdin, null, null]
    });
    cp.stderr
      .pipe(concat(function(err) {
        expect(err.toString()).to.contain('Failed to get context from file nofile\n');
        done();
      }));
  });

  it('should error when commit input files dont exist', function(done) {
    var cp = spawn(cliPath, ['nofile', 'fakefile'], {
      stdio: [process.stdin, null, null]
    });
    cp.stderr
      .pipe(concat(function(err) {
        err = err.toString();
        expect(err).to.contain('Failed to read file nofile\n');
        expect(err).to.contain('Failed to read file fakefile\n');
        done();
      }));
  });

  it('should error when commit input file is invalid line delimited json', function(done) {
    var cp = spawn(cliPath, ['test/fixtures/invalid_line_delimited.json'], {
      stdio: [process.stdin, null, null]
    });
    cp.stderr
      .pipe(concat(function(err) {
        expect(err.toString()).to.contain('Failed to split commits in file test/fixtures/invalid_line_delimited.json\n');
        done();
      }));
  });

  it('should error when commit input file is invalid line delimited json if it is not tty', function(done) {
    var cp = spawn(cliPath, [], {
      stdio: [fs.openSync('test/fixtures/invalid_line_delimited.json', 'r'), null, null]
    });
    cp.stderr
      .pipe(concat(function(err) {
        expect(err.toString()).to.contain('Failed to split commits\n');
        done();
      }));
  });
});
