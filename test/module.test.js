/*
  Use `npm test` to run tests using mocha.
  or `./node_modules/.bin/mocha --reporter spec`
*/

var path = require( 'path' )
  , Bark = require( path.resolve( path.join( __dirname, '..' ) ) )
  , expect = require( 'chai' ).expect;


describe('Bark', function( done ) {

  it('should load as a module', function(done) {
    expect( Bark ).to.exist;
    done();
  });
  it('should set its config', function(done) {
    expect( Bark.config ).to.exist;
    done();
  });
  it('should default to safe mode', function(done) {
    expect( Bark.config.safemode ).to.equal( true );
    done();
  });
  it('should default to non-verbosity', function(done) {
    expect( Bark.config.verbose ).to.equal( false );
    done();
  });
});

describe('Bark.parse()', function( done ) {
  it('should parse an EAN-13', function( done ) {
    Bark.parse('3281014704901');
    expect( Bark.type ).to.equal( 'EAN-13' );
    done();
  });

  it('should parse an ITF-14', function( done ) {
    Bark.parse('17312133015982');
    expect( Bark.type ).to.equal( 'ITF-14' );
    done();
  });
  it('should parse an ITF-14', function( done ) {
    Bark.parse('17312133015982');
    expect( Bark.type ).to.equal( 'ITF-14' );
    done();
  });

  it('should parse the GTIN from a GS1-128 code', function( done ) {
    Bark.parse('015730033004934115160817');
    expect( Bark.id() ).to.equal( '57300330049341' );
    expect( Bark.get('GTIN') ).to.equal( '57300330049341' );
    done();
  });

  it('should parse the BEST BEFORE', function( done ) {
    Bark.parse('015730033004934115160817');
    expect( Bark.get('BEST BEFORE') ).to.equal( '160817' );
    done();
  });

  it('should parse the NET WEIGHT with 3 decimal points', function( done ) {
    Bark.parse('01573003300493413103160817');
    expect( Bark.get('NET WEIGHT') ).to.equal( 160.817 );
    done();
  });
  it('should parse the NET WEIGHT without decimal points', function( done ) {
    Bark.parse('01573003300493413100160817');
    expect( Bark.get('NET WEIGHT') ).to.equal( 160817 );
    done();
  });

  it('should clear parsed AIs in safemode when it encounters an error', function( done ) {
    Bark.parse('01573003300493419999999999999');
    expect( Bark.id() ).to.equal( '01573003300493419999999999999' );
    expect( Bark.get('GTIN') ).to.equal( undefined );
    done();
  });
  it('should not clear parsed AIs in when safemode is off', function( done ) {
    Bark.setConfig({safemode: false});
    Bark.parse('01573003300493419999999999999');
    expect( Bark.get('GTIN') ).to.equal( '57300330049341' );
    done();
  });

});

describe('Bark.id()', function( done ) {
  it('should return the string itself when parse fails', function( done ) {
    Bark.parse('foo bar');
    expect( Bark.id() ).to.equal( 'foo bar' );
    expect( Bark.get('GTIN') ).to.equal( undefined );
    done();
  });
});
