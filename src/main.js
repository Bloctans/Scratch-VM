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
let ranscripts = []

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
//Attempts to accurately mimic the scratch coord system

function u_errorm(msg) {
    alert(msg)
}

async function cachesvgfromzip(img) {
    if (proj[0].isStage == true) {
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
        u_errorm("IMGCACHE Error: Error while caching imgs: First target not stage")
    }
}

async function initsprites() {
    for (let i = 1; i <= proj.length-1; i++) {
        try {
            const currcostume = proj[i].currentCostume

            spritenames.push(proj[i].name)
            spriteimg.push(proj[i].costumes[currcostume].md5ext)
            spritex.push(proj[i].x)
            spritey.push(proj[i].y)
            spritesize.push(proj[i].size)
            spritedir.push(proj[i].direction)
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
            proj = JSON.parse(proj).targets
            await initsprites()
        });
    } else {
        u_errorm("File Read Error: Project is not an sb3 file.")
    }
}
// Manages The .SB3 File Upload.

function resetaftergf() {
    ranscripts = []
}
//will reset green flag stuff

//--[[               MINIFIED STUFF                 ]]

function runproj(){running=!0; resetaftergf()}function stopproj(){running=!1}
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
//every time a script not in a forever is ran, the MD5 is stored in this list so that the emulator knows 
//not to run it, it is reset when the green flag is clicked again

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
function degToRad (deg) {
    return deg * Math.PI / 180;
}

let notinloop = true

function nextblock(md5,script2,sprite) {
    if (!ranscripts.includes(md5)) {
        var csi = 0
        for (let i = 0; i < spritenames.length; i++) {
            if (spritenames == sprite.name) {
                csi = i
            }
        }
        var blockscurr2 = script2[md5]
        if (blockscurr2.opcode == "motion_movesteps") {
            const steps = parseInt(blockscurr2.inputs.STEPS[1][1])
            const radians = degToRad(90 - spritedir[csi]);
            const dx = steps * Math.cos(radians);
            const dy = steps * Math.sin(radians);
            spritex[csi] += dx
            spritey[csi] += dy
        } else if (blockscurr2.opcode == "motion_gotoxy") {
            spritex[csi] = parseInt(blockscurr2.inputs.X[1][1])
            spritey[csi] = parseInt(blockscurr2.inputs.Y[1][1])
        } else if (blockscurr2.opcode == "motion_turnleft") {
            spritedir[csi] -= parseInt(blockscurr2.inputs.DEGREES[1][1])
        } else if (blockscurr2.opcode == "motion_turnright") {
            spritedir[csi] += parseInt(blockscurr2.inputs.DEGREES[1][1])
        }
    }
    if (notinloop) { //placeholder, replace once loop code
        if (script2[script2[md5].parent].opcode != "event_whenkeypressed") {
            ranscripts.push(md5)
        }
    }
}

let key_down = "nokey"

function Keyhandle(e) {
    key_down = e.code
    if (key_down == "ArrowUp") {
        key_down = "up arrow"
    } else if (key_down == "ArrowDown") {
        key_down = "down arrow"
    }
}

function Keyhandle2() {
    key_down = "nokey"
}

addEventListener('keydown', Keyhandle);
addEventListener('keyup', Keyhandle2);

let debounce = 0

function spritefencing(spritei) {
    if (spritex[spritei] < -450) {
        spritex[spritei] = -449/2
    } else if (spritex[spritei] > 320) {
        spritex[spritei] = 319
        console.log("fencing active")
    }
}

function blockparser(sprit) {
    const sprite = proj[sprit+1]
    var script = sprite.blocks
    for (let i = 0; i < glen(script); i++) {
        var blockcurr = script[Object.keys(script)[i]]
        if (blockcurr.opcode == "event_whenflagclicked") {
            nextblock(blockcurr.next,script,sprite) 
        } else if (blockcurr.opcode == "event_whenkeypressed") {
            debounce += 1
            if (debounce == 2) {
                debounce = 0
                if (blockcurr.fields.KEY_OPTION[0] == key_down.toLowerCase()) {
                    nextblock(blockcurr.next,script,sprite)
                }
            }
        }
    }
}

function rendersprites() {
    for (let i = 0; i < spriteimg.length; i++) {
        rendersvgfromzip(i,spritex[i],spritey[i],spritedir[i]-90,0)
        blockparser(i)
        //spritefencing(i)
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
    const currbg = proj[0].currentCostume
    const bgx = proj[0].costumes[currbg].rotationCenterX
    const bgy = proj[0].costumes[currbg].rotationCenterY
    cct.drawImage(bg,w/2 - bgx, h/2 - bgy,w + (w-480),h + (h-360))
    rendersprites()
}
//Renders Project

async function parsebg() {
    const currbg = proj[0].currentCostume
    const bgf = proj[0].costumes[currbg].assetId+".svg"

    if (proj[0].isStage == true) {
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