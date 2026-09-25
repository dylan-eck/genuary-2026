#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

in vec2 vTexCoord;

out vec4 fragColor;

float TAU = 6.28318;

vec3 palette(float t) {
    // vec3 a = vec3(0.228, 0.927, 0.724);
    // vec3 b = vec3(0.947, 0.524, 0.003);
    // vec3 c = vec3(0.802, 0.432, 0.999);
    // vec3 d = vec3(0.596, 3.460, 2.900);

    // vec3 a = vec3(0.648, 0.224, 0.675);
    // vec3 b = vec3(0.545, 0.795, 0.232);
    // vec3 c = vec3(0.576, 0.694, 1.435);
    // vec3 d = vec3(0.745, 4.768, 3.327);

    vec3 a = vec3(0.555, 0.558, 0.975);
    vec3 b = vec3(0.237, 0.570, 0.863);
    vec3 c = vec3(0.588, 0.390, 0.340);
    vec3 d = vec3(1.259, 4.051, 4.972);

    return a + b * cos(6.28318 * (c * t + d));
}

float sdHexagon( in vec2 p, in float r )
{
    const vec3 k = vec3(-0.866025404,0.5,0.577350269);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= vec2(clamp(p.x, -k.z*r, k.z*r), r);
    return length(p)*sign(p.y);
}

mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s,  c);
}

void main() {
    vec2 uv = vTexCoord * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;
    vec2 uv0 = uv;

    float ct = mod(4.0 * uTime, 1.0);
    vec3 c = palette(length(uv0) + 1.0 - abs(2.0 * ct - 1.0));

    vec3 finalColor = vec3(0);

    for (float i = 0.0; i < 4.0; i++) {
        float dir = (uv0.x < 0.0) ? -1.0 : 1.0;
        dir *= (uv.y < 0.0) ? -1.0 : 1.0;

        uv = fract(1.5 * uv) - 0.5;

        float tt = mod(6.0 * uTime, 1.0);
        float p = sdHexagon(uv * rot(0.5 * dir * TAU * tt), 0.2);
        // float p = sdHexagon(uv, 0.2);
        p *= exp(-1.2 * length(uv0));
        p = sin(14.0 * p + TAU * tt + 0.4 * i) / 14.0;
        p = abs(p);
        p = 0.006 / p;
        p = pow(p, 1.2);

        finalColor += c * p;
    }

    fragColor = vec4(finalColor, 1.0);
}