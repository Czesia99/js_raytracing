import { Rectangle } from "./rectangle.js"
import { vertexShaderSource, fragmentShaderSource } from "./quad_shader.js";

const canvas = document.querySelector("#glcanvas")
export const gl = canvas.getContext("webgl2")


let quad = new Rectangle(vertexShaderSource, fragmentShaderSource)
let resizefinished = null;
//max 10, modify in shader if needed
const spheresData = [
    { pos: [5.0, 6.0, 4.0], radius: 4.0, material: { color: [1.0, 0.0, 0.0, 1.0], emissionColor : [1.0, 1.0, 1.0, 1.0], emissionStrength : 2.0}},
    { pos: [0.0, 0.0, 5.0], radius: 1.0, material: { color: [0.0, 1.0, 0.0, 1.0], emissionColor : [0.0, 0.0, 0.0, 0.0], emissionStrength : 0.0 }},
    { pos: [1.0, -1.0, 2.0], radius: 0.5, material: { color: [0.3, 0.5, 1.0, 1.0], emissionColor : [0.0, 0.0, 1.0, 0.0], emissionStrength : 0.0}},
    { pos: [-1.0, -1.2, 2.0], radius: 0.2, material: { color: [0.44, 0.2, 1.0, 1.0], emissionColor : [0.44, 0.2, 1.0, 1.0], emissionStrength : 2.0}},
    { pos: [-1.6, -1.0, 2.0], radius: 0.4, material: { color: [0.44, 0.2, 1.0, 1.0], emissionColor : [0.0, 0.0, 1.0, 0.0], emissionStrength : 0.0}},
    { pos: [0.0, -21.0, 5.0], radius: 20.0, material: { color: [0.9, 0.7, 0.7, 1.0], emissionColor : [0.0, 0.0, 0.0, 0.0], emissionStrength : 0.0}},
];

function main() {
    resize()
    gl.clearColor(0.2, 0.2, 0.2, 1)
    update()
}

function update() {
    let maxBounceCount = 30;
    let numRays = 10000;
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(quad.shader.program)

    let resolutionLocation = gl.getUniformLocation(quad.shader.program, "resolution")
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height)

    let maxBounceLocation = gl.getUniformLocation(quad.shader.program, "MaxBounceCount")
    gl.uniform1i(maxBounceLocation, maxBounceCount)

    let numRaysLocation = gl.getUniformLocation(quad.shader.program, "NumRaysPerPixel")
    gl.uniform1i(numRaysLocation, numRays)

    setSpheres(quad.shader.program, spheresData)
    
    quad.render()
    console.log("render")
}

addEventListener("resize", () => {
    if (resizefinished !== null)
        clearTimeout(resizefinished)
    resizefinished = setTimeout(resize, 100)
});

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
    requestAnimationFrame(() => update(gl))
}

function setSpheres(program, spheres)
{
    for (let i = 0; i < spheres.length; i++)
    {
        const sphere = spheres[i];

        let posLocation = gl.getUniformLocation(program, `spheres[${i}].pos`);
        gl.uniform3fv(posLocation, sphere.pos);

        let radiusLocation = gl.getUniformLocation(program, `spheres[${i}].radius`);
        gl.uniform1f(radiusLocation, sphere.radius);

        let colorLocation = gl.getUniformLocation(program, `spheres[${i}].material.color`);
        gl.uniform4fv(colorLocation, sphere.material.color);

        let colorEmissionLocation = gl.getUniformLocation(program, `spheres[${i}].material.emissionColor`);
        gl.uniform4fv(colorEmissionLocation, sphere.material.emissionColor);

        let emissionStrengthLocation = gl.getUniformLocation(program, `spheres[${i}].material.emissionStrength`);
        gl.uniform1f(emissionStrengthLocation, sphere.material.emissionStrength);
    }

    let numSpheresLocation = gl.getUniformLocation(program, 'NumSpheres');
    gl.uniform1i(numSpheresLocation, spheres.length);
}

main()