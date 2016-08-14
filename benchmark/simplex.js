var Noise = require( '../' )

suite( 'Simplex', function() {

  var simplex = new Noise.Simplex()

  bench( 'constructor', function() {
    new Noise.Simplex()
  })

  bench( '1D', function() {
    var x = 0
    simplex.generate1D( x++ )
  })

  bench( '2D', function() {
    var x = 0, y = 0
    simplex.generate2D( x++, y++ )
  })

  bench( '3D', function() {
    var x = 0, y = 0, z = 0
    simplex.generate3D( x++, y++, z++ )
  })

  bench( '4D', function() {
    var x = 0, y = 0, z = 0, w = 0
    simplex.generate4D( x++, y++, z++, w++ )
  })

})
