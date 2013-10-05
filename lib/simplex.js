
function dot( g, x, y, z, w ) {
  switch( arguments.length ) {
    case 2: return g[0] * x
    case 3: return g[0] * x + g[1] * y
    case 4: return g[0] * x + g[1] * y + g[2] * z
    case 5: return g[0] * x + g[1] * y + g[2] * z + g[3] * w
  }
}

/**
 * Gradient map for 2D and 3D noise
 * @type {Array}
 */
const grad3 = [
  [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0], 
  [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1], 
  [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]
]

/**
 * Gradient map for 4D noise
 * @type {Array}
 */
const grad4 = [
  [0,1,1,1],  [0,1,1,-1],  [0,1,-1,1],  [0,1,-1,-1],
  [0,-1,1,1], [0,-1,1,-1], [0,-1,-1,1], [0,-1,-1,-1],
  [1,0,1,1],  [1,0,1,-1],  [1,0,-1,1],  [1,0,-1,-1],
  [-1,0,1,1], [-1,0,1,-1], [-1,0,-1,1], [-1,0,-1,-1],
  [1,1,0,1],  [1,1,0,-1],  [1,-1,0,1],  [1,-1,0,-1],
  [-1,1,0,1], [-1,1,0,-1], [-1,-1,0,1], [-1,-1,0,-1],
  [1,1,1,0],  [1,1,-1,0],  [1,-1,1,0],  [1,-1,-1,0],
  [-1,1,1,0], [-1,1,-1,0], [-1,-1,1,0], [-1,-1,-1,0]
]

/**
 * A lookup table to traverse the simplex around a given point in 4D.
 * Details can be found where this table is used, in the 4D noise method.
 * @type {Array}
 */
const lookup = [
  [0,1,2,3], [0,1,3,2], [0,0,0,0], [0,2,3,1], [0,0,0,0], [0,0,0,0], [0,0,0,0], [1,2,3,0], 
  [0,2,1,3], [0,0,0,0], [0,3,1,2], [0,3,2,1], [0,0,0,0], [0,0,0,0], [0,0,0,0], [1,3,2,0], 
  [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], 
  [1,2,0,3], [0,0,0,0], [1,3,0,2], [0,0,0,0], [0,0,0,0], [0,0,0,0], [2,3,0,1], [2,3,1,0], 
  [1,0,2,3], [1,0,3,2], [0,0,0,0], [0,0,0,0], [0,0,0,0], [2,0,3,1], [0,0,0,0], [2,1,3,0], 
  [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], 
  [2,0,1,3], [0,0,0,0], [0,0,0,0], [0,0,0,0], [3,0,1,2], [3,0,2,1], [0,0,0,0], [3,1,2,0], 
  [2,1,0,3], [0,0,0,0], [0,0,0,0], [0,0,0,0], [3,1,0,2], [0,0,0,0], [3,2,0,1], [3,2,1,0]
]

/**
 * Simplex constructor
 * @param {Object} rng
 */
function Simplex( rng ) {
  
  this.p = new Uint8Array( 512 )
  
  // Either use a given Random Number Generator
  // or the global Noise default RNG
  rng = rng || Noise._RNG
  
  // Populate the permutation table
  for( var i = 0; i < 512; i++ ) {
    this.p[i] = this.p[ i & 255 ] ||
      rng.random() * 256
  }
  
}

// Exports
module.exports = Simplex

// Inherit from Noise
var $ = Simplex.prototype = Object.create(
  require( '../' ).prototype
)

/**
 * Prototype's constructor
 * @type {Function}
 */
$.constructor = Simplex

/**
 * Generate 2D noise
 * @param  {Number} x
 * @param  {Number} y
 * @return {Number}  
 */
$.generate2D = function( x, y ) {
  
  // Noise contributions from the three corners
  var n0, n1, n2
  // Skew the input space to determine which simplex cell we're in
  var F2 = 0.5 * ( Math.sqrt(3) - 1 )
  // Hairy factor for 2D
  var s = ( x + y ) * F2
  
  var i = Math.floor( x + s )
  var j = Math.floor( y + s )
  
  var G2 = ( 3 - Math.sqrt(3) ) / 6
  var t = ( i + j ) * G2
  
  // Unskew the cell origin back to (x,y) space
  var X0 = i - t
  var Y0 = j - t
  
  // The x, y distances from the cell origin
  var x0 = x - X0
  var y0 = y - Y0
  
  // For the 2D case, the simplex shape is an equilateral triangle.
  // Determine which simplex we are in.
  
  // Offsets for second (middle) corner of simplex in (i,j) coords
  var i1, j1
  
  if( x0 > y0 ) {
    // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    i1 = 1; j1 = 0
  } else {
    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    i1 = 0; j1 = 1
  }
  
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
  // c = (3-sqrt(3))/6
  
  // Offsets for middle corner in (x,y) unskewed coords
  var x1 = x0 - i1 + G2
  var y1 = y0 - j1 + G2
  
  // Offsets for last corner in (x,y) unskewed coords
  var x2 = x0 - 1.0 + 2.0 * G2
  var y2 = y0 - 1.0 + 2.0 * G2
  
  // Work out the hashed gradient indices of the three simplex corners
  var ii = i & 255
  var jj = j & 255
  
  var perm = this.p
  var grad3 = grad3
  
  var gi0 = perm[ ii + perm[ jj ] ] % 12
  var gi1 = perm[ ii + i1 + perm[ jj + j1 ] ] % 12
  var gi2 = perm[ ii + 1 + perm[ jj + 1 ] ] % 12
  
  // Calculate the contribution from the three corners
  var t0 = 0.5 - x0 * x0 - y0 * y0
  
  // (x,y) of grad3 used for 2D gradient
  if( t0 < 0 ) {
    n0 = 0.0
  } else {
    t0 *= t0
    n0 = t0 * t0 * dot( grad3[ gi0 ], x0, y0 )
  }
  
  var t1 = 0.5 - x1 * x1 - y1 * y1
  
  if( t1 < 0 ) {
    n1 = 0.0
  } else {
    t1 *= t1
    n1 = t1 * t1 * dot( grad3[ gi1 ], x1, y1 )
  }
  
  var t2 = 0.5 - x2 * x2 - y2 * y2
  if( t2 < 0 ) {
    n2 = 0.0
  } else {
    t2 *= t2
    n2 = t2 * t2 * dot( grad3[ gi2 ], x2, y2 )
  }
  
  // Add contributions from each corner to get the final noise value.
  // The result is scaled to return values in the interval [-1,1].
  return 70.0 * ( n0 + n1 + n2 )
  
}

/**
 * Generate 3D noise
 * @param  {Number} x
 * @param  {Number} y
 * @param  {Number} z
 * @return {Number}  
 */
$.generate3D = function( x, y, z ) {
  
}

/**
 * Generate 4D noise
 * @param  {Number} x
 * @param  {Number} y
 * @param  {Number} z
 * @param  {Number} w
 * @return {Number}  
 */
$.generate4D = function( x, y, z, w ) {
  
}
