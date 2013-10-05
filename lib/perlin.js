
const B  = 0x100
const BM = 0xFF

const N  = 0x1000
const NP = 12 // 2^N
const NM = 0xFFF

function curve( t ) {
  return t * t * ( 3 - 2 * t )
}

function lerp( t, a, b ) {
  return a + t * ( b - a )
}

function at2( q, rx, ry ) {
  return rx * q[0] + ry * q[1]
}

function at3( q, rx, ry, rz ) {
  return rx * q[0] + ry * q[1] + rz * q[2]
}

function normalize2( v ) {
  
  var s = Math.sqrt(
    v[0] * v[0] + v[1] * v[1]
  )
  
  v[0] = v[0] / s
  v[1] = v[1] / s
  
}

function normalize3( v ) {
  
  var s = Math.sqrt(
    v[0] * v[0] + v[1] * v[1] + v[2] * v[2]
  )
  
  v[0] = v[0] / s
  v[1] = v[1] / s
  v[2] = v[2] / s
  
}

function init( rng, p, g1, g2, g3) {
  
  var i, j, k
  
  function random() {
    return 0 | ( rng.random() * 256 )
  }
  
  for( i = 0; i < B; i++ ) {
    
    p[i] = i;
    g1[i] = ((random() % (B + B)) - B) / B
    
    for( j = 0; j < 2; j++ )
      g2[i][j] = ((random() % (B + B)) - B) / B
    normalize2( g2[i] )
    
    for( j = 0; j < 3; j++ )
      g3[i][j] = ((random() % (B + B)) - B) / B
    normalize3( g3[i] )
    
  }

  while( --i ) {
    k = p[i]
    p[i] = p[ j = random() % B ]
    p[j] = k
  }

  for( i = 0; i < B + 2; i++ ) {
    
    p[ B + i ] = p[i]
    g1[ B + i ] = g1[i]
    
    for( j = 0; j < 2; j++ )
      g2[ B + i ][j] = g2[i][j]
    
    for( j = 0; j < 3; j++ )
      g3[ B + i ][j] = g3[i][j]
    
  }
  
}

/**
 * Perlin constructor
 * @param {Object} rng
 */
function Perlin( rng ) {
  
  // Either use a given Random Number Generator
  // or the global Noise default RNG
  rng = rng || Noise._RNG
  
  // Gradient maps
  this.g1 = new Array( B + B + 2 )
  this.g2 = new Array( B + B + 2 )
  this.g3 = new Array( B + B + 2 )
  
  for( var i = 0; i < ( B + B + 2 ); i++ ) {
    this.g2[i] = new Array( 2 )
    this.g3[i] = new Array( 3 )
  }
  
  // Permutation table
  this.p = new Uint8Array( B + B + 2 )
  
  // Init gradient maps and permutation table
  init( rng, this.p, this.g1, this.g2, this.g3 )
  
}

// Exports
module.exports = Perlin

// Inherit from Noise
var $ = Perlin.prototype = Object.create(
  require( '../' ).prototype
)

/**
 * Prototype's constructor
 * @type {Function}
 */
$.constructor = Perlin

$.generate1D = function( x ) {
  
  var bx0, bx1
  var rx0, rx1, sx, t, u, v
  
  // Setup
  t = x + N
  bx0 = ( t >>> 0 ) & BM
  bx1 = ( bx0 + 1 ) & BM
  rx0 = t - ( t >>> 0 )
  rx1 = rx0 - 1.0
  
  sx = curve( rx0 )
  
  u = rx0 * this.g1[ this.p[ bx0 ] ]
  v = rx1 * this.g1[ this.p[ bx1 ] ]
  
  return lerp( sx, u, v )
  
}

$.generate2D = function( x, y ) {
  
}

$.generate3D = function( x, y, z ) {
  
}
