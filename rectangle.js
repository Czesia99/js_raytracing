import {gl} from "./raytracing.js"
import { Shader } from "./shader.js"

export class Rectangle {
    constructor(vertexShaderSource, fragmentShaderSource) {
        this.vertexShaderSource = vertexShaderSource
        this.fragmentShaderSource = fragmentShaderSource
        this.shader = new Shader(this.vertexShaderSource, this.fragmentShaderSource);
        let positionAttributeLocation = gl.getAttribLocation(this.shader.program, "a_position");

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.ebo = gl.createBuffer();
        this.vbo = gl.createBuffer();

        let rectangleVerticesBuffer = new Float32Array(this.rectangle_vertices);
        let indicesBuffer = new Uint32Array(this.indices);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, rectangleVerticesBuffer, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)
    }

    render() {
        gl.useProgram(this.shader.program)
        gl.bindVertexArray(this.vao)
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
    }

    rectangle_vertices = [
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
    ]

    indices = [
        0, 1, 2,
        0, 2, 3,
    ]
}

