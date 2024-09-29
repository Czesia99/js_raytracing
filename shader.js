import {gl} from "./raytracing.js"

export class Shader
{
    constructor(vertex, fragment) {
        this.vertex = vertex
        this.fragment = fragment
        this.program = null;

        let vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertex);
        let fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragment);

        if (!vertexShader || !fragmentShader) {
            throw new Error('Shader failed.');
        }

        this.program = this.createProgram(gl, vertexShader, fragmentShader);

        if (!this.program) {
            throw new Error('Program failed.');
        }
    }
        
    createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
    
    createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
}
    