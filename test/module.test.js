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

  it('should parse the BEST BEFORE from a GS1-128 code', function( done ) {
    Bark.parse('015730033004934115160817');
    expect( Bark.get('BEST BEFORE') ).to.equal( '160817' );
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
