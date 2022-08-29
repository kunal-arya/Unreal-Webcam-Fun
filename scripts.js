const video = document.querySelector('.player');
let rgbBtns = document.querySelector(".rgb");
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const takePhotoBtn = document.querySelector("#take-photo-btn");
// filters
const redEffectBtn = document.getElementById("red-filter");
const rgbSplitBtn = document.getElementById("rgb-split");
const greenScreenBtn = document.getElementById("greenScreen");
// boolean values to apply filter
let isRedEffect = false;
let isRgbSplit = false;
let isGreenScreen = false;

function getVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
     .then(LocalMediaStream => {
        video.srcObject = LocalMediaStream;
        video.play();
     })
     .catch(err => {
        console.error(`OH NO!!!`, err);
     })
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        // Take the Pixels Out
        let pixels = ctx.getImageData(0,0,width,height);
        // Mess with them
        if(isRedEffect) {
            pixels = redEffect(pixels);
            ctx.globalAlpha = 1;
        }
        
        if(isRgbSplit) {
            pixels = rgbSplit(pixels);
            ctx.globalAlpha = 0.1;
        }

        if(isGreenScreen) {
            pixels = greenScreen(pixels);
            ctx.globalAlpha = 1;
        }
        // put them back
        ctx.putImageData(pixels,0,0);
    }, 16)
}



function takePhoto() {
    // Played the sound
    snap.currentTime = 0;
    snap.play();

    // take the data out of the canvas
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'Handsome');
    link.innerHTML = `<img src="${data}" alt="A Handsome Man" />`
    strip.insertBefore(link,strip.firstChild);
}

function redEffect(pixels) {
    for(let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i + 0] += 100; // RED
        pixels.data[i + 1] -= 50; // Green
        pixels.data[i + 2] *= 0.5; // blue; 
    }
    return pixels;
}

function rgbSplit(pixels) {
    for(let i = 0; i < pixels.data.length; i+= 4) {
        pixels.data[i - 150] = pixels.data[i + 0] // red
        pixels.data[i + 500] = pixels.data[i + 1] // green
        pixels.data[i - 550] = pixels.data[i + 2] // Blue
    }
    return pixels;
}

function greenScreen(pixels) {
    const levels = {};

    document.querySelectorAll(`.rgb input`).forEach(input => {
        levels[input.name] = input.value;
    })

    for(let i = 0; i < pixels.data.length; i += 4) {
        red = pixels.data[i + 0]; // red
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if ( red >= levels.rmin 
            && green >= levels.gmin
            && blue >= levels.bmin
            && red <= levels.rmax
            && green <= levels.gmax
            && blue <= levels.bmax ) {
                // take it out
                pixels.data[i + 3] = 0;
        }
    }

    return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);
takePhotoBtn.addEventListener("click", takePhoto);
redEffectBtn.addEventListener("click" , () => {
    isRedEffect = !isRedEffect;
    isGreenScreen = false;
    isRgbSplit = false;
    rgbBtns.classList.add("rgb-hide");
    console.log(rgbBtns.classList);
})
rgbSplitBtn.addEventListener("click", () => {
    isRgbSplit = !isRgbSplit;
    isRedEffect = false;
    isGreenScreen = false;
    rgbBtns.classList.add("rgb-hide");
})
greenScreenBtn.addEventListener("click" , () => {
    isGreenScreen = !isGreenScreen;
    rgbBtns.classList.toggle("rgb-hide");
    isRedEffect = false;
    isRgbSplit = false;
})
