#version 300 es
precision highp float;

#define PI 3.1415926538

uniform float u_time;
uniform vec2 u_resolution;

in vec2 vTexCoord;
out vec4 frag_color;

vec3 srgb_to_linear(vec3 srgb) {
    vec3 cutoff = step(0.04045, srgb);
    vec3 low = srgb / 12.92;
    vec3 high = pow((srgb + 0.055) / 1.055, vec3(2.4));
    return mix(low, high, cutoff);
}

vec3 linear_to_srgb(vec3 linear) {
    vec3 cutoff = step(0.0031308, linear);
    vec3 low = linear * 12.92;
    vec3 high = 1.055 * pow(linear, vec3(1.0 / 2.4)) - 0.055;
    return mix(low, high, cutoff);
}

vec3 linear_to_oklab(vec3 c) {
    float l = 0.4122214708 * c.x + 0.5363325363 * c.y + 0.0514459929 * c.z;
    float m = 0.2119034982 * c.x + 0.6806995451 * c.y + 0.1073969566 * c.z;
    float s = 0.0883024619 * c.x + 0.2817188376 * c.y + 0.6299787005 * c.z;

    float l_ = pow(l, 1.0 / 3.0);
    float m_ = pow(m, 1.0 / 3.0);
    float s_ = pow(s, 1.0 / 3.0);

    return vec3(
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    );
}

vec3 oklab_to_linear(vec3 c) {
    float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
    float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
    float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    return vec3(
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    );
}

vec3 oklab_to_oklch(vec3 lab) {
    float C = sqrt(lab.y * lab.y + lab.z * lab.z);
    float h = atan(lab.z, lab.y);
    if (h < 0.0) {
        h += 2.0 * PI;
    }
    return vec3(lab.x, C, h);
}

vec3 oklch_to_oklab(vec3 lch) {
    float a = lch.y * cos(lch.z);
    float b = lch.y * sin(lch.z);
    return vec3(lch.x, a, b);
}

vec3 rgb_to_oklch(vec3 rgb) {
    vec3 linear = srgb_to_linear(rgb);
    vec3 lab = linear_to_oklab(linear);
    return oklab_to_oklch(lab);
}

vec3 oklch_to_rgb(vec3 lch) {
    vec3 lab = oklch_to_oklab(lch);
    vec3 linear = oklab_to_linear(lab);
    return linear_to_srgb(linear);
}

vec3 interpolate_oklch(vec3 rgb1, vec3 rgb2, float t) {
    vec3 lch1 = rgb_to_oklch(rgb1);
    vec3 lch2 = rgb_to_oklch(rgb2);
    float dh = mod(lch2.z - lch1.z + PI, 2.0 * PI) - PI;

    float h_interp = mod(lch1.z + t * dh, 2.0 * PI);
    if (h_interp < 0.0) {
        h_interp += 2.0 * PI;
    }

    vec3 lch_interp = vec3(
        lch1.x + t * (lch2.x - lch1.x),
        lch1.y + t * (lch2.y - lch1.y),
        h_interp
    );

    return oklch_to_rgb(lch_interp);
}

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

    return mix(mix(hash(i + ivec2(0,0)),
                   hash(i + ivec2(1,0)), u.x),
               mix(hash(i + ivec2(0,1)),
                   hash(i + ivec2(1,1)), u.x), u.y);
}

float fbm(in vec2 p) {
    float f = 0.0;
    float s = 0.1;

    f += 0.500000 * noise(p + s * 0.50 * u_time);
    p *= 2.01;

    f += 0.250000 * noise(p - s * 0.49 * u_time);
    p *= 2.03;

    f += 0.125000 * noise(p + s * 0.99 * u_time);
    p *= 1.99;

    f += 0.062500 * noise(p - s * 1.02 * u_time);
    p *= 2.02;

    f += 0.031250 * noise(p + s * 2.01 * u_time);
    p *= 1.98;

    f += 0.015625 * noise(p - s * 2.00 * u_time);

    return f / 0.984375;
}

void main() {
    vec2 uv_norm = vTexCoord * 2.0 - 1.0;
    uv_norm.x *= u_resolution.x / u_resolution.y;

    float f = fbm(uv_norm) * 0.5 + 0.5;

    vec3 color = interpolate_oklch(vec3(1.0, 0.925, 0.862), vec3(1.0, 0.961, 0.933), f);

    frag_color = vec4(color, 1.0);
}