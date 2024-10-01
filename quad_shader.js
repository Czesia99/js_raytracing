export let vertexShaderSource = `#version 300 es
in vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

export let fragmentShaderSource = `#version 300 es
precision highp float;

out vec4 outColor;

uniform vec2 resolution;

struct Ray {
    vec3 origin;
    vec3 dir;
};

struct RayTracingMaterial
{
    vec4 color;
    vec4 emissionColor;
    float emissionStrength;
};

struct HitInfo {
    bool didHit;
    float dst;
    vec3 hitPoint;
    vec3 normal;
    RayTracingMaterial material;
};

struct Sphere
{
    vec3 pos;
    float radius;
    RayTracingMaterial material;
};

uniform Sphere spheres[10];
uniform int NumSpheres;
uniform int MaxBounceCount;
uniform int NumRaysPerPixel;

float RandomValue(inout uint state)
{
    state = state * 747796405u + 2891336453u;
    uint result = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    result = (result >> 22) ^ result;
    return float(result) / 4294967295.0;
}

float RandomValueNormalDistribution(inout uint state)
{
    float theta = 2.0 * 3.1415926 * RandomValue(state);
    float rho = sqrt(-2.0 * log(RandomValue(state)));
    return rho * cos(theta);
}

vec3 RandomDirection(inout uint state)
{
    float x = RandomValueNormalDistribution(state);
    float y = RandomValueNormalDistribution(state);
    float z = RandomValueNormalDistribution(state);
    return normalize(vec3(x, y, z));
}

vec3 RandomHemisphereDirection(vec3 normal, inout uint rngState)
{
    vec3 dir = RandomDirection(rngState);
    return dir * sign(dot(normal, dir));
}

HitInfo RaySphere(Ray ray, vec3 sphereCenter, float sphereRadius)
{
    HitInfo hitInfo;

    hitInfo.didHit = false;
    hitInfo.dst = 0.0;
    hitInfo.hitPoint = vec3(0.0);
    hitInfo.normal = vec3(0.0);

    vec3 offsetRayOrigin = ray.origin - sphereCenter;

    float a = dot(ray.dir, ray.dir);
    float b = 2.0 * dot(offsetRayOrigin, ray.dir);
    float c = dot(offsetRayOrigin, offsetRayOrigin) - sphereRadius * sphereRadius;

    float discriminant = b * b - 4.0 * a * c;

    if (discriminant >= 0.0) {
        float dst = (-b - sqrt(discriminant)) / (2.0 * a);

        if (dst >= 0.0) {
            hitInfo.didHit = true;
            hitInfo.dst = dst;
            hitInfo.hitPoint = ray.origin + ray.dir * dst;
            hitInfo.normal = normalize(hitInfo.hitPoint - sphereCenter);
        }
    }

    return hitInfo;
}

HitInfo CalculateRayCollision(Ray ray)
{
    HitInfo closestHit;

    closestHit.didHit = false;
    closestHit.dst = 0.0;
    closestHit.hitPoint = vec3(0.0);
    closestHit.normal = vec3(0.0);
    
    closestHit.dst = 1e20;

    for (int i = 0; i < NumSpheres; i++)
    {
        Sphere sphere = spheres[i];
        HitInfo hitInfo = RaySphere(ray, sphere.pos, sphere.radius);

        if (hitInfo.didHit && hitInfo.dst < closestHit.dst)
        {
            closestHit = hitInfo;
            closestHit.material = sphere.material;
        }
    }

    return closestHit;
}

vec3 Trace(Ray ray, inout uint rngState)
{
    vec4 incomingLight = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 rayColor = vec4(1.0, 1.0, 1.0, 1.0);
    for (int i = 0; i <= MaxBounceCount; i++)
    {
        HitInfo hitInfo = CalculateRayCollision(ray);
        if (hitInfo.didHit)
        {
            ray.origin = hitInfo.hitPoint;
            ray.dir = RandomHemisphereDirection(hitInfo.normal, rngState);

            RayTracingMaterial material = hitInfo.material;
            vec3 emittedLight = material.emissionColor.rgb * material.emissionStrength;
            incomingLight += vec4(emittedLight, 0.0) * rayColor;
            rayColor *= material.color;
        } else { break; }
    }
    return incomingLight.rgb;
}

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
    // vec2 uv = gl_FragCoord.xy / resolution;
    vec3 viewPoint = vec3(uv, 1.0);

    //test random value
    vec2 numPixels = resolution.xy;
    vec2 pixelCoords = gl_FragCoord.xy * numPixels;
    float pixelIndex = pixelCoords.y * numPixels.x + pixelCoords.x;

    uint rngState = uint(pixelIndex) * 2891336453u;

    Ray ray;
    ray.origin = vec3(0.0, 0.0, 0.0);
    ray.dir = normalize(viewPoint - ray.origin);

    vec3 totalIncomingLight = vec3(0.0, 0.0, 0.0);

    for (int rayIndex = 0; rayIndex < NumRaysPerPixel; rayIndex++)
    {
        totalIncomingLight += Trace(ray, rngState);
    }

    vec3 pixelCol = totalIncomingLight / float(NumRaysPerPixel);

    outColor = vec4(pixelCol, 1);
}
`;