precision highp float;

uniform vec2 uResolution;
varying vec2 vTexCoord;

uniform vec3 uColorA;
uniform vec3 uColorB;

const vec3 CAMERA_POSITION = vec3(4.0, -4.0, 4.0);

const int NUM_BOXES = 10;
uniform vec3 uBoxPositions[NUM_BOXES];
uniform vec3 uBoxSizes[NUM_BOXES];

const float PI = 3.141592653589793;

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

vec3 interpolate_oklch(vec3 lch1, vec3 lch2, float t) {
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

float sdf_union(float sdfA, float sdfB) {
  return min(sdfA, sdfB);
}

float sdf_smooth_union(float sdfA, float sdfB, float k ) {
    k *= 4.0;
    float h = max(k - abs(sdfA - sdfB), 0.0);
    return min(sdfA, sdfB) - h * h * 0.25 / k;
}

float sdf_intersection(float sdfA, float sdfB) {
  return max(sdfA, sdfB);
}

float sdf_subtraction(float sdfA, float sdfB) {
    return max(-sdfA, sdfB);
}

float sdf_smooth_subtraction(float d1, float d2, float k)
{
    return -sdf_smooth_union(d1, -d2, k);
}

float sphere_sdf(vec3 test_point, vec3 center, float radius) {
    return (length(test_point - center) - radius);
}

float box_sdf(vec3 test_point, vec3 dims ) {
  vec3 q = abs(test_point) - dims;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float round_box_sdf(vec3 test_point, vec3 dims, float r) {
  vec3 q = abs(test_point) - dims + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float world_sdf(vec3 test_point) {
    float res = 1e20;


    for (int i = 0; i < NUM_BOXES; i++) {
      float box = round_box_sdf(test_point - uBoxPositions[i], uBoxSizes[i], 0.05);
      res = sdf_smooth_union(res, box, 0.05);
    }

    return res;
}


vec3 compute_normal(vec3 test_point ) {
   const float eps = 0.0005;
    const float k = 0.57735027;

    vec3 n = vec3(0.0);

    n += vec3( 1.0,  1.0,  1.0) * world_sdf(test_point + eps * vec3( 1.0,  1.0,  1.0) * k);
    n += vec3(-1.0, -1.0,  1.0) * world_sdf(test_point + eps * vec3(-1.0, -1.0,  1.0) * k);
    n += vec3(-1.0,  1.0, -1.0) * world_sdf(test_point + eps * vec3(-1.0,  1.0, -1.0) * k);
    n += vec3( 1.0, -1.0, -1.0) * world_sdf(test_point + eps * vec3( 1.0, -1.0, -1.0) * k);

    return normalize(n);
}


vec4 march_ray(vec3 ray_origin, vec3 ray_direction) {
    const int MAX_STEPS = 256;
    const float HIT_DISTANCE = 0.001;
    const float MAXIMUM_TRACE_LENGTH = 200.0;

    float distance_traveled = 0.0;
    for (int i = 0; i < MAX_STEPS; ++i) {
        vec3 current_position = ray_origin + distance_traveled * ray_direction;

        float distance_to_closest = world_sdf(current_position);

        if (distance_to_closest <= HIT_DISTANCE) {
            vec3 normal = compute_normal(current_position);

            vec3 light_position = vec3(1.0, -3.0, 1.0);
            vec3 direction_to_light = normalize(light_position - current_position);
            vec3 view_direction = normalize(CAMERA_POSITION - current_position);
            vec3 halfway_vector = normalize(direction_to_light + view_direction);

            float ambient = 0.2;
            float diffuse = max(dot(normal, direction_to_light), 0.0);
            float specular = pow(max(dot(normal, halfway_vector), 0.0), 32.0);

            vec3 base_color = interpolate_oklch(uColorA, uColorB, current_position.y * 0.2);
            vec3 color = 2.0 * base_color * (ambient + diffuse); //+ vec3(1.0) * specular;

            return vec4(color, 1.0);
        }


        if (distance_traveled > MAXIMUM_TRACE_LENGTH) {
            return vec4(0.0);
        }

        distance_traveled += distance_to_closest;
    }

  return vec4(0.0);
}

void main() {
    vec2 uv = vTexCoord;
    uv -= vec2(0.5);
    uv.x *= uResolution.x / uResolution.y;

    vec3 camera_pos = CAMERA_POSITION;
    vec3 target = vec3(0.0, 0.0, 0.0);
    vec3 world_up = vec3(0.0, 1.0, 0.0);

    vec3 forward = normalize(target - camera_pos);
    vec3 right   = normalize(cross(forward, world_up));
    vec3 up      = cross(right, forward);

    float ortho_scale = 4.0;

    vec3 ray_origin =
        camera_pos +
        right * (uv.x * ortho_scale) +
        up    * (uv.y * ortho_scale);

    vec3 ray_direction = forward;

    vec4 color = march_ray(ray_origin, ray_direction);

    gl_FragColor = color;
}