#version 300 es
precision highp float;

uniform sampler2D u_prev_frame;

out vec4 frag_color;
vec4 cell(ivec2 p) {
    ivec2 size = textureSize(u_prev_frame, 0);

    p.x = (p.x % size.x + size.x) % size.x;
    p.y = (p.y % size.y + size.y) % size.y;

    return texelFetch(u_prev_frame, p, 0);
}

vec2 ring(float rOuter, float rInner) {
    ivec2 p0 = ivec2(gl_FragCoord.xy);

    float sum = 0.0;
    float count = 0.0;

    for (float i = -rOuter; i <= rOuter; i++) {
        for (float j = -rOuter; j <= rOuter; j++) {

            float d = round(length(vec2(i, j)));

            if (d <= rOuter && d > rInner) {
                sum += cell(p0 + ivec2(i, j)).r;
                count += 1.0;
            }
        }
    }

    return vec2(sum, count);
}

float sumOfNeighbors() {
    ivec2 p = ivec2(gl_FragCoord.xy);

    return
        cell(p + ivec2(-1,  0)).r +
        cell(p + ivec2( 1,  0)).r +
        cell(p + ivec2( 0,  1)).r +
        cell(p + ivec2( 0, -1)).r +

        cell(p + ivec2(-1,  1)).r +
        cell(p + ivec2( 1,  1)).r +
        cell(p + ivec2(-1, -1)).r +
        cell(p + ivec2( 1, -1)).r;
}

vec2 mnca01() {
    vec4 c = cell(ivec2(gl_FragCoord.xy));
    float newV = c.r;

    vec2 nh0_res = ring(8.0, 6.0);
    vec2 nh1_res = ring(3.0, 0.0);


    float nh0 = nh0_res[0] / nh0_res[1];
    float nh1 = nh1_res[0] / nh1_res[1];


    if( nh0 >= 0.185 && nh0 <= 0.20 ) { newV = 1.0; }
    if( nh0 >= 0.343 && nh0 <= 0.580 ) { newV = 0.0; }
    if( nh0 >= 0.700 && nh0 <= 0.850 ) { newV = 0.0; }

    if( nh1 >= 0.120 && nh1 <= 0.280 ) { newV = 0.0; }
    if( nh1 >= 0.445 && nh1 <= 0.676 ) { newV = 1.0; }

    if( nh0 >= 0.150 && nh0 <= 0.160 ) { newV = 0.0; }


    // if( nh0 >= 0.185 && nh0 <= 0.20 ) { newV = 1.0; }
    // if( nh0 >= 0.343 && nh0 <= 0.580 ) { newV = 0.0; }
    // if( nh0 >= 0.700 && nh0 <= 0.850 ) { newV = 0.0; }

    // if( nh1 >= 0.120 && nh1 <= 0.280 ) { newV = 0.0; }
    // if( nh1 >= 0.445 && nh1 <= 0.680 ) { newV = 1.0; }

    // if( nh0 >= 0.150 && nh0 <= 0.180 ) { newV = 0.0; }


    float age = c.g;

    if (newV > 0.5) {
        age -= 0.01;
    } else {
        age = 1.0;
    }

    age = max(age, 0.3);

    return vec2(newV, age);
}

void main() {
    vec2 res = mnca01();
    frag_color = vec4(res.r, res.g, 0.0, 1.0);
}