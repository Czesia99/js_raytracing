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

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
    vec3 viewPoint = vec3(uv, 1.0);

    Ray ray;
    ray.origin = vec3(0.0, 0.0, 0.0);
    ray.dir = normalize(viewPoint - ray.origin);

    // HitInfo hitInfo = RaySphere(ray, vec3(0.0, 0.0, 5.0), 1.0);
    HitInfo hitInfo = CalculateRayCollision(ray);

    if (hitInfo.didHit) {
        outColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else {
        outColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
`;