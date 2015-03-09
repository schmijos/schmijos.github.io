wurscht3000
===========

This is my first own video codec. It's a very bad one. Also the library design isn't good yet.

## Concept
There's a base palette containing RGB colors. These are used for vector additions in the cubic RGB color space (cyclic by modulo 256). For every frame pixel *s* we want to encode, we calculate all cubic color distances (in a cycle of modulo 256) from the previously decoded frame pixel *p* to the base palette colors. The shortest distance is saved as a diff frame pixel.

The decoding is simply adding all diff colors in modulo 256.

## Example
See the encoding of a small video here: http://schmijos.github.io/
The codec isn't very good for stills yet.

Coming soon: a video of u-d-p eating meat paste!
