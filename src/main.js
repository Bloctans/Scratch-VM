console.log("Hey im the first thing that gets shown!")

var jszip = import("./lib/jszip.min.js")
var jszipu = import("./lib/jszip-utils.min.js")

let running = false
//Check if project running

var proj = null //Porject SB3
var projzip = null //Project JSON

var spritenames = []
var spriteimg = []
var spritex = []
var spritey = []
var spritedir = []
var spritesize = []
var sprites = 0

function resetsprites() {
    spritenames = []
    spriteimg = []
    spritex = []
    spritey = []
    spritedir = []
    spritesize = []
    sprites = 0
}
//resets

window.addEventListener('load',function() {
    initsite()
})

function initsite() {
    sb3 = document.getElementById("uploadsb3")
    sb3.addEventListener("change", sb3upload,false)
    canvas = document.getElementById("scratch");
    cct = canvas.getContext("2d");
    cct.fillStyle = "white"
    cct.fillRect(0,0,canvas.width,canvas.height)
    window.requestAnimationFrame(scratchmain)
}
//Start Site

function frect(x,y,w,h,c) {
    cct.fillStyle = c
    cct.fillRect(x,y,w,h)
}
//Allows fillrect to be called without the fillstyle

function u_scratchcoord(x,y) {
    //idk
    return x,y
}

function u_errorm(msg) {
    alert(msg)
}

function initsprites() {
    for (let i = 1; i <= JSON.parse(proj).targets.length-1; i++) {
        try {
            var currcostume = JSON.parse(proj).targets[i].currentCostume

            spritenames.push(JSON.parse(proj).targets[i].name)
            spriteimg.push(JSON.parse(proj).targets[i].costumes[currcostume].md5ext)
            spritex.push(JSON.parse(proj).targets[i].x)
            spritey.push(JSON.parse(proj).targets[i].y)
            spritesize.push(JSON.parse(proj).targets[i].size)
            spritedir.push(JSON.parse(proj).targets[i].direction)
        } catch (error) {
            running = false
            u_errorm("Init Sprites Error: " + error)
            throw error
        }
    }
}
//Initalizes Sprites

async function sb3upload() {
    running = false
    resetsprites()
    var fileto = this.files[0]
    var name = fileto.name
    var filetype = name.substring(name.length-4,name.length)
    if (filetype == ".sb3" ) {
        JSZip.loadAsync(fileto).then(async function (zip) {
            projzip = zip
            proj = await zip.file("project.json").async("string")
            initsprites()
        });
    } else {
        u_errorm("File Read Error: Project is not an sb3 file.")
    }
}
// Manages The .SB3 File Upload.


//--[[               MINIFIED STUFF                 ]]

function runproj(){running=!0}function stopproj(){running=!1}
//!0 = true
//!1 = false

function imgrot(img,x,y,w,h,r) {
    cct.translate( x+w/2, y+h/2 );
    cct.rotate( r*Math.PI/180);
    cct.translate( -x-w/2, -y-h/2 );
    cct.drawImage(img,x,y,w,h)
    cct.setTransform(1,0,0,1,0,0)
}
//rotate image

// this function is from the work of Taylor Hunt found at https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
function encodeSvg(e){return e.replace("<svg",~e.indexOf("xmlns")?"<svg":'<svg xmlns="http://www.w3.org/2000/svg"').replace(/"/g,"'").replace(/%/g,"%25").replace(/#/g,"%23").replace(/{/g,"%7B").replace(/}/g,"%7D").replace(/</g,"%3C").replace(/>/g,"%3E").replace(/\s+/g," ")}
//Encodes SVG for data URL Usage

//[[                     End                        ]]

function rendersprites() {
    
}

function renderproj() {
    rendersprites()
}
//Renders Project

async function parsebg() {
    var currbg = JSON.parse(proj).targets[0].currentCostume
    var bgf = JSON.parse(proj).targets[0].costumes[currbg].assetId+".svg"

    if (JSON.parse(proj).targets[0].isStage == true) {
        var bg = await projzip.file(bgf).async("string")
        var fbg = encodeSvg(bg)
        var bg_e = new Image()
        var p = new DOMParser()
        bg_e.onload = function() {
            frect(0,0,canvas.width,canvas.height,"white")
            var w = bg_e.width;
            var h = bg_e.height;
            cct.drawImage(bg_e,-w/4,-h/4,w*2,h*2)
            renderproj()
        }
        bg_e.src = "data:image/svg+xml;utf-8," + fbg
    } else {
        running = false
        u_errorm("JSON Parsing Error: Cannot continue, sprite one isnt a stage")
    }
}
//Manages Background

async function scratchmain() {
    if (running) {
        if (proj != null) {
            await parsebg()
        } 
        if (proj == null) {
            console.log("t")
            frect(0,0,canvas.width,canvas.height,"white")
            cct.font = '48px Arial'
            cct.fillStyle = "Black"
            cct.fillText("No Project",canvas.width/2.8,canvas.height/2)
        }
    } 
    else {
        if (proj != null) {
            frect(0,0,canvas.width,canvas.height,"white")
            cct.font = '48px Arial'
            cct.fillStyle = "Black"
            cct.fillText("Project Found! Press Start!",canvas.width/5,canvas.height/2)
        } 
    }
    sprites = spritenames.length
    window.requestAnimationFrame(scratchmain)
}
//Main Loop