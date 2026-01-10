#version 300 es
precision highp float;

uniform sampler2D u_prev_frame;

in vec2 uv;
out vec4 frag_color;

float hash(ivec2 p) {
    int n = p.x * 3 + p.y * 113;

    n = (n << 13) ^ n;
    n = n * (n * n * 15731 + 789221) + 1376312589;
    return -1.0 + 2.0 * float(n & 0x0fffffff) / float(0x0fffffff);
}

float noise(vec2 p) {
    ivec2 i = ivec2(floor(p));
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(hash(i + ivec2(0, 0)),
                   hash(i + ivec2(1, 0)), u.x),
               mix(hash(i + ivec2(0, 1)),
                   hash(i + ivec2(1, 1)), u.x), u.y);
}

float sampleTexture(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return 0.0;
  }
  return texture(u_prev_frame, uv).r;
}

float sumOfNeighbors() {
  vec2 texel = 1.0 / vec2(textureSize(u_prev_frame, 0));

    float l  = sampleTexture(uv + vec2(-texel.x,  0.0));
    float r  = sampleTexture(uv + vec2( texel.x,  0.0));
    float t  = sampleTexture(uv + vec2( 0.0,  texel.y));
    float b  = sampleTexture(uv + vec2( 0.0, -texel.y));

    float tl = sampleTexture(uv + vec2(-texel.x,  texel.y));
    float tr = sampleTexture(uv + vec2( texel.x,  texel.y));
    float bl = sampleTexture(uv + vec2(-texel.x, -texel.y));
    float br = sampleTexture(uv + vec2( texel.x, -texel.y));

  return l + r + t + b + tl + tr + bl + br;
}

float gameOfLife() {
    float s = sumOfNeighbors();

    float alive = step(0.5, sampleTexture(uv));

    float next = alive;
    if (alive > 0.5 && (s < 2.0 || s > 3.0)) {
      next = 0.0;
    } else if (alive < 0.5 && s > 2.5 && s < 3.5) {
      next = 1.0;
    }

    return next;
}

float rugRule() {
//   if (uv.x > 0.1 && uv.x < 0.3 && uv.y > 0.1 && uv.y < 0.3) {
//     return 0.0;
//   }

    float v = sumOfNeighbors() / 8.0 + 1.0 / 256.0;
    v = mod(v, 1.0);
//     v = floor(v * 256.0) / 256.0;
    return v;
}

void main() {
    float v = rugRule();
    frag_color = vec4(v, 0.0, 0.0, 1.0);
    // frag_color = vec4(vec3(v), 1.0);
}