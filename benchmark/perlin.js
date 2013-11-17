var Noise = require( '../' )

suite( 'Perlin', function() {
  
  var perlin = new Noise.Perlin()
  
  bench( 'constructor', function() {
    new Noise.Perlin()
  })
  
  bench( '1D', function() {
    var x = 0
    perlin.generate1D( x++ )
  })
  
  bench( '2D', function() {
    var x = 0, y = 0
    perlin.generate2D( x++, y++ )
  })
  
  bench( '3D', function() {
    var x = 0, y = 0, z = 0
    perlin.generate3D( x++, y++, z++ )
  })
  
  bench( '4D', function() {
    var x = 0, y = 0, z = 0, w = 0
    perlin.generate4D( x++, y++, z++, w++ )
  })
  
})