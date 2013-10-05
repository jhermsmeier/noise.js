/**
 * Noise constructor
 */
function Noise() {}

function NOIMPL() {
  throw new Error( 'Not implemented' )
}

module.exports = Noise

/**
 * Random Number Generator used
 * by noise generation algorithms
 * @type {Object}
 */
Noise._RNG = Math

// Colors
Noise.White = NOIMPL
Noise.Pink = NOIMPL
Noise.Brown = NOIMPL
Noise.Blue = NOIMPL
Noise.Violet = NOIMPL
Noise.Grey = NOIMPL

// ...
Noise.Perlin = require( './lib/perlin' )
Noise.Simplex = require( './lib/simplex' )
Noise.Worley = NOIMPL
Noise.Wavelet = NOIMPL
Noise.Cell = NOIMPL

/**
 * Noise prototype
 * @type {Object}
 */
Noise.prototype = {
  
  constructor: Noise,
  
  generate: function( x, y, z, w ) {
    return this[
      'generate' + arguments.length + 'D'
    ].apply( this, arguments )
  }
  
}
