var fragShader = `


precision mediump float;

// Uniforms that can be passed from the JavaScript.
uniform float iTime; // Time in seconds since the webpage loaded.
uniform vec2 iResolution; // The resolution of the canvas.
uniform vec2 iMouse;
const int N = 1;
const float r = .5;

vec4 rot(vec4 p,float a, float b,float c,float d,float e)
{

 vec4 pt;
 float co = cos(a);
 float si = sin(a);
 
 pt = vec4(co*p.x - si*p.y,si*p.x + co*p.y,p.z,p.w);
 p = pt+0.;
 co = cos(b);
 si = sin(b);
 pt = vec4(co*p.x - si*p.z,p.y,si*p.x + co*p.z,p.w);
 p = pt+0.;
 
 co = cos(c);
 si = sin(c);
 pt = vec4(co*p.x - si*p.w,p.y,p.z,si*p.x + co*p.w);
 p = pt+0.;
 
 co = cos(d);
 si = sin(d);
 pt = vec4(p.x,co*p.y - si*p.w,p.z,si*p.y + co*p.w);
 p = pt+0.;
 
 co = cos(e);
 si = sin(e);
 pt = vec4(p.x,p.y,co*p.z - si*p.w,si*p.z + co*p.w);
 p = pt+0.;
 
 return p;
 
}

vec3 path2(vec4 v, vec4 p, vec4 ps[N])
{
    vec3 col = vec3(0,0,0);
    
    float closest = 10000000.;
    
    for (int n= 0; n < N; n++)
    {
    
    vec4 c = ps[n] - p;

    
    float A = sqrt( pow(dot(v,-c),2.) - (dot(c,c) - r * r));
    
    float colorangle = float(n)/float(N)*3.1415*2.;
    
    if (A>0.)
    {
        float d = - dot(v,-c) - A;
        if (d<closest && d > 0.)
        {
            col = vec3(cos(colorangle*50.)/2.+.7,cos(colorangle*2.21+.9)/2.+.5,cos(colorangle*4.333)/2.+.5);
            closest = d;
            
            
        
        }
        
    }
    }
    return col;
}
vec3 path(vec4 v, vec4 p, vec4 ps[N])
{
    vec3 col = vec3(p.x,p.y,0);
    
    float closest = 10000000000.;
    
    for (int n= 0; n < N; n++)
    {
    
    vec4 c = ps[n] - p;
    
   
    float A = sqrt( pow(dot(v,-c),2.) - (dot(c,c) - r * r));
    
    float colorangle = float(n)/float(N)*3.1415*2.;
    
    //.x=A;
    
    
    if (A>0.)
    {
        float d = - dot(v,-c) - A;
        if (d<closest && d > 0.)
        {
            col = vec3(cos(colorangle*50.)/2.+.7,cos(colorangle*2.21+.9)/2.+.5,cos(colorangle*4.333)/2.+.5);
            closest = d;
            
        
        
            vec4 intersect = v*d;
            vec4 norm = intersect - c;
            norm /= length(norm);
                
            vec3 pc = path2(v - 2.*dot(v,norm)*norm,p+intersect,ps);
            
            if (dot(pc,pc)>0.1){
            col = pc;
            }
        
        }
        
    }
    }
    return col;
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    
vec2 uv = fragCoord / iResolution.y;
    float constpix = iResolution.x / (2.0 * iResolution.y);
    vec4 v = vec4(uv - vec2(constpix, .5), .5, 0) / length(vec4(uv - vec2(constpix, .5), .5, 0));
    vec4 v1 = vec4(0, 0, 1, 0);
    vec4 ps[N];
    vec4 norms[8];
    vec4 planes[8];


    for (int d = 0; d < 4; d++)
    {
    for (int neg = 0; neg < 2; neg++) {
        vec4 a = vec4(float(d == 0), float(d == 1), float(d == 2), float(d == 3));
        a -= 2.0 * float(neg) * a;
        norms[2 * d + neg] = planes[2 * d + neg] = a * 0.7;
        float rotParam = iTime * 0.01;
        float mouseX = iMouse.x / 100.0, mouseY = iMouse.y / 100.0;
        norms[2 * d + neg] = rot(norms[2 * d + neg], 0.0, rotParam, mouseX, mouseY, mouseX);
        planes[2 * d + neg] = rot(planes[2 * d + neg], 0.0, rotParam, mouseX, mouseY, mouseX);
        }
    }

        ps[N - 1] = vec4(0, 0, 0, 0);

        for (int n = 0; n < N; n++) {
            ps[n] = rot(ps[n], 0.0, iTime, iMouse.x / 100.0, iMouse.y / 100.0, 0.0);
        }

        vec3 col = vec3(0, 0, 0);
        vec4 p = -v1 * 0.6;
        bool flag = false;
        vec4 newv, newp;

        for (int d = 0; d < 17; d++) {
            vec3 thiscol = vec3(0, 0, 0);
            float closest = flag ? 0.0 : 1e11;

            for (int n = 0; n < N; n++) {
                vec4 c = ps[n] - p;
                float A = sqrt(pow(dot(v, -c), 2.0) - (dot(c, c) - r * r));
                float colorangle = float(n) / float(N) * 3.1415 * 2.0;

                if (A > 0.0) {
                    float dist = -dot(v, -c) - A;
                    if (dist < closest && dist > 0.0) {
                        flag = false;
                        closest = dist;
                        thiscol = vec3(cos(50.0 * colorangle) / 2.0 + .7, cos(2.21 * colorangle + .9) / 2.0 + .5, cos(4.333 * colorangle) / 2.0 + .5);
                        vec4 intersect = v * dist;
                        vec4 norm = (intersect - c) / length(intersect - c);
                        newv = v - 2.0 * dot(v, norm) * norm;
                        newp = p + intersect;
                                        if (A < 0.10) {
                    col = vec3(0, 0, 0);
                    flag = true;
                }
            }
        }
    }

    for (int n = 0; n < 8; n++) {
        vec4 No = norms[n] / length(norms[n]);
        vec4 p0 = planes[n] - p;
        float dist = dot(p0, No) / dot(v, No);
        float colorangle = float(n) / float(N) * 3.1415 * 2.0;
        if (dist < closest && dist > 0.001) {
            thiscol = vec3(cos(50.0 * colorangle) / 2.0 + .7, cos(2.21 * colorangle + .9) / 2.0 + .5, cos(4.333 * colorangle) / 2.0 + .5);
            closest = dist;
            vec4 intersect = v * dist;
            newv = v - 2.0 * dot(v, No) * No;
            newp = intersect + p;
        }
    }

    v = newv;
    p = newp;
    if (closest < 10000.0 && !flag) {
        col += .2 * (thiscol) / (pow(1.2, float(closest) + 1.0));
    } else {
        col = vec3(0, 0, 0);
    }
}

    // Output to screen
    gl_FragColor = vec4(col, 1.0);
}

`;
















var canvas = document.getElementById("glCanvas");
var gl = canvas.getContext("webgl");

if (!gl) {
    console.log("WebGL not supported, falling back on experimental-webgl");
    gl = canvas.getContext("experimental-webgl");
}

if (!gl) {
    alert("Your browser does not support WebGL");
}

// Vertex shader source code
var vertShader = `
attribute vec4 vertexPosition;
void main() {
    gl_Position = vertexPosition;
}`;


// Function to compile a shader
function compileShader(gl, source, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

var vertexShader = compileShader(gl, vertShader, gl.VERTEX_SHADER);
var fragmentShader = compileShader(gl, fragShader, gl.FRAGMENT_SHADER);

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
}

gl.useProgram(shaderProgram);

var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

var vertices = [
    1.0,  1.0,
   -1.0,  1.0,
    1.0, -1.0,
   -1.0, -1.0
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
var vertexPosition = gl.getAttribLocation(shaderProgram, "vertexPosition");
gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vertexPosition);

// Uniform locations
var uTimeLocation = gl.getUniformLocation(shaderProgram, "iTime");
var uResolutionLocation = gl.getUniformLocation(shaderProgram, "iResolution");
var uMouseLocation = gl.getUniformLocation(shaderProgram, "iMouse");

// Initialize mouse position
var mousePosition = { x: 0, y: 0 };

// Function to update mouse position
function updateMousePosition(event) {
    mousePosition.x = event.clientX;
    mousePosition.y = canvas.height - event.clientY; // Invert y-coordinate to match WebGL coordinate system
}

// Add mouse event listeners
canvas.addEventListener('mousemove', updateMousePosition);

var startTime = Date.now();

// Handle window resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Call once to set initial size

// Toggle fullscreen on double click
canvas.addEventListener('dblclick', function() {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

function drawScene() {
    var currentTime = Date.now();
    var elapsedTime = (currentTime - startTime) / 1000.0; // Convert to seconds
    gl.uniform1f(uTimeLocation, elapsedTime);
    gl.uniform2f(uMouseLocation, mousePosition.x, mousePosition.y);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(drawScene);
}

drawScene();
