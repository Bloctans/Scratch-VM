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
var spritew = []
var spriteh = []
var spritedir = []
var spritesize = []
var spritecache = []
var sprites = 0

function resetsprites() {
    spritenames = []
    spriteimg = []
    spritex = []
    spritey = []
    spritew = []
    spriteh = []
    spritedir = []
    spritesize = []
    spritecache = []
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
    document.getElementById("loadbg").remove()
    window.requestAnimationFrame(scratchmain)
}
//Start Site

function frect(x,y,w,h,c) {
    cct.fillStyle = c
    cct.fillRect(x,y,w,h)
}
//Allows fillrect to be called without the fillstyle

function toscratchcoord(x,y,w,h) {
    //idk
    x = canvas.width/2-(w/2)+x
    y = canvas.height/2-(h/2)+y * -1
    return [x,y]
}

function u_errorm(msg) {
    alert(msg)
}

async function cachesvgfromzip(img) {
    if (JSON.parse(proj).targets[0].isStage == true) {
        const svgdecomp = await projzip.file(img).async("string")
        var svgencode = encodeSvg(svgdecomp)
        var svgimg = new Image()
        svgimg.onload = function() {
            spritecache.push(svgimg)
            spritew.push(svgimg.width)
            spriteh.push(svgimg.height)
        }
        svgimg.src = "data:image/svg+xml;utf-8," + svgencode
    } else {
        running = false
        u_errorm("IMGCACHE Error: Error while caching imgs")
    }
}

async function initsprites() {
    for (let i = 1; i <= JSON.parse(proj).targets.length-1; i++) {
        try {
            const currcostume = JSON.parse(proj).targets[i].currentCostume

            spritenames.push(JSON.parse(proj).targets[i].name)
            spriteimg.push(JSON.parse(proj).targets[i].costumes[currcostume].md5ext)
            spritex.push(JSON.parse(proj).targets[i].x)
            spritey.push(JSON.parse(proj).targets[i].y)
            spritesize.push(JSON.parse(proj).targets[i].size)
            spritedir.push(JSON.parse(proj).targets[i].direction)
            await cachesvgfromzip(spriteimg[i-1])
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
    const fileto = this.files[0]
    const name = fileto.name
    var filetype = name.substring(name.length-4,name.length)
    if (filetype == ".sb3" ) {
        JSZip.loadAsync(fileto).then(async function (zip) {
            projzip = zip
            proj = await zip.file("project.json").async("string")
            await initsprites()
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

async function rendersvgfromzip(img,x,y,rot,size) {
    let tosc = toscratchcoord(x,y,spritew[img],spriteh[img])
    imgrot(spritecache[img],tosc[0],tosc[1],spritew[img],spriteh[img],rot)
}

var renderdone = true
var i2 = 0

function glen(json) {
    return Object.keys(json).length
}

//block def layout:
//md5hash: {
//    "opcode": block,
//    "next": md5hash,
//    "parent": null or md5hash,
//    "inputs": {}, //same as the comment under
//    "fields": {}, //currently no usage for the vm
//    "shadow": false, //dont understand what this is
//    "topLevel": true, //layering is nonexistant currently
//    "x": 218, //no use to vm
//    "y": 241 //same as 171
//}

var startnextscript = null

function blockparser(sprit) {
    const sprite = JSON.parse(proj).targets[sprit+1]
    var script = sprite.blocks
    for (let i = 0; i < glen(script); i++) {
        var blockcurr = script[Object.keys(script)[i]]
        startnextscript = blockcurr.opcode == "event_whenflagclicked"
        if (startnextscript) {
            console.log(script[blockcurr.next])
        }
    }
}

function rendersprites() {
    for (let i = 0; i < spriteimg.length; i++) {
        rendersvgfromzip(i,spritex[i],spritey[i],0,100)
        blockparser(i)
    }
}

function delay(time) {
	return new Promise(resolve => setTimeout(resolve, time));
	//Make sure to put the function as "async runction"
}

function renderproj(bg) {
    i2 += 1
    frect(0,0,canvas.width,canvas.height,"white")
    const w = Math.floor(bg.width);
    const h = Math.floor(bg.height);
    const currbg = JSON.parse(proj).targets[0].currentCostume
    const bgx = JSON.parse(proj).targets[0].costumes[currbg].rotationCenterX
    const bgy = JSON.parse(proj).targets[0].costumes[currbg].rotationCenterY
    console.log(w/2 - bgx)
    console.log(h/2-bgy)
    cct.drawImage(bg,w/2 - bgx, h/2 - bgy,w + (w-480),h + (h-360))
    rendersprites()
}
//Renders Project

async function parsebg() {
    const currbg = JSON.parse(proj).targets[0].currentCostume
    const bgf = JSON.parse(proj).targets[0].costumes[currbg].assetId+".svg"

    if (JSON.parse(proj).targets[0].isStage == true) {
        var bg = await projzip.file(bgf).async("string")
        var fbg = encodeSvg(bg)
        var bg_e = new Image()
        bg_e.onload = function() {
            renderproj(bg_e)
        }
        bg_e.src = "data:image/svg+xml;utf-8," + fbg
    } else {
        running = false
        u_errorm("JSON Parsing Error: Cannot continue, sprite one isnt a stage")
    }
}
//Manages Background

function noproj() {
    frect(0,0,canvas.width,canvas.height,"white")
    cct.font = '16px Arial'
    cct.fillStyle = "Black"
    cct.fillText("No Project",canvas.width/2.4,canvas.height/2)
}

function scratchmain() {
    if (running) {
        if (proj != null) {
            parsebg()
        } 
        if (proj == null) {
            noproj()
        }
    } 
    else {
        if (proj != null) {
            frect(0,0,canvas.width,canvas.height,"white")
            cct.font = '16px Arial'
            cct.fillStyle = "Black"
            const s = "Project Found! Press Start!"
            cct.fillText(s,canvas.width/3.4,canvas.height/2)
        } 
        if (proj == null) {
            noproj()
        }
    }
    sprites = spritenames.length
    window.requestAnimationFrame(scratchmain)
}
//Main Loop