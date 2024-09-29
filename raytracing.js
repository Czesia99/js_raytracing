import { Rectangle } from "./rectangle.js"
import { vertexShaderSource, fragmentShaderSource } from "./quad_shader.js";

const canvas = document.querySelector("#glcanvas")
export const gl = canvas.getContext("webgl2")


let quad = new Rectangle(vertexShaderSource, fragmentShaderSource)

//max 10, modify in shader if needed
const spheresData = [
    { pos: [0.5, 0.5, 1.0], radius: 0.2, material: { color: [1.0, 0.0, 0.0, 1.0] }},
    { pos: [-0.5, -0.5, 1.5], radius: 0.2, material: { color: [0.0, 1.0, 0.0, 1.0] }},
    { pos: [0.5, -0.5, 1.0], radius: 0.1, material: { color: [0.0, 0.0, 1.0, 1.0] }},
];

function main() {
    resize()
    gl.clearColor(0.2, 0.2, 0.2, 1)

    update()
}

function update() {
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(quad.shader.program)

    let resolutionLocation = gl.getUniformLocation(quad.shader.program, "resolution")
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height)

    setSpheres(quad.shader.program, spheresData)
    
    quad.render()
    requestAnimationFrame(() => update(gl))
}

addEventListener("resize", resize);

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
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
    }

    let numSpheresLocation = gl.getUniformLocation(program, 'NumSpheres');
    gl.uniform1i(numSpheresLocation, spheres.length);
}

main()