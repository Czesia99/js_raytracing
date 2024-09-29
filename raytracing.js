import { Rectangle } from "./rectangle.js"
import { vertexShaderSource, fragmentShaderSource } from "./quad_shader.js";

const canvas = document.querySelector("#glcanvas")
export const gl = canvas.getContext("webgl2")


let quad = new Rectangle(vertexShaderSource, fragmentShaderSource)

function main() {
    resize()
    gl.clearColor(0.2, 0.2, 0.2, 1)

    update()
}

function update() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(quad.shader.program)
    gl.uniform2f(gl.getUniformLocation(quad.shader.program, "resolution"), canvas.width, canvas.height)  
    quad.render()
    requestAnimationFrame(() => update(gl))
}

addEventListener("resize", resize);

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
}


main()