// Generates a base palette for cyclic additive HAM7
function generateBasePalette() {
   /* 
    return [
        [ 31, 17, 13],
        [ 13, 31, 17],
        [ 17, 13, 31],
        [240,240,240],
    ];
*/

    return [
        [ 10, 0, 0],
        [ 0, 10, 0],
        [ 0, 0, 10],
        [245,0,0],
        [0,245,0],
        [0,0,245],
        [30,30,30],
        [225,225,225]
    ];

}

// Calculate the nearest distance from the previously shown pixel to the next one
function calcBestDiffIndex(prevEncodedFrame, nextSourceFrame, pixelOffset, basePalette) {
    var prevR, prevG, prevB, nextR, nextG, nextB, minIndex;
    var minDistance = 9999;

    // calculate distance between previously encoded frame and the next one to be encoded
    prevR = prevEncodedFrame[pixelOffset];
    prevG = prevEncodedFrame[pixelOffset+1];
    prevB = prevEncodedFrame[pixelOffset+2];
    
    nextR = nextSourceFrame[pixelOffset]; 
    nextG = nextSourceFrame[pixelOffset+1]; 
    nextB = nextSourceFrame[pixelOffset+2]; 

    // now choose the best base color vector
    for (var i = 0; i < basePalette.length; i++) {
        // calculate distance between diff and base palette
        var dist = Math.pow(
            Math.pow( (prevR + basePalette[i][0]) % 256 - nextR, 2) + 
            Math.pow( (prevG + basePalette[i][1]) % 256 - nextG, 2) +
            Math.pow( (prevB + basePalette[i][2]) % 256 - nextB, 2)
        , 0.5); // Euclidian Distance       

        dist = dist % 256;
        // keep the smallest distance
        if (dist < minDistance) {
            minDistance = dist;
            minIndex = i;
        }        
    }

    return minIndex;
}

// Calculate the jump diff to reach the next frame
function calcNewDiffFrame(resDiffFrame, prevEncodedFrame, nextSourceFrame, basePalette) {
    for (var i = 0; i < resDiffFrame.length; i++) {
        resDiffFrame[i] = calcBestDiffIndex(prevEncodedFrame, nextSourceFrame, 4*i, basePalette);
    }
}

// Render pixel by pixel on a canvas context
function renderFrame(ctx, diff, width, height, basePalette) {
    imageData = ctx.getImageData(0, 0, width, height);
    var diffPos = 0;
    for (var i = 0; i < imageData.data.length; diffPos++) {
        var diffColor = basePalette[diff[diffPos]];
        imageData.data[i] = (imageData.data[i++] + diffColor[0]) % 256; // Red
        imageData.data[i] = (imageData.data[i++] + diffColor[1]) % 256; // Green
        imageData.data[i] = (imageData.data[i++] + diffColor[2]) % 256; // Blue
        imageData.data[i] = imageData.data[i++]; // Alpha
    }
    ctx.putImageData(imageData, 0, 0);
}

/*
// One Pixel Still Frame Test
(function(){
    var basePalette = generateBasePalette();
    var currentDiffFrame = [ 0 ];
    var currentRenderFrame = [ 0,0,0,0 ];
    var stillSourceFrame = [ 0,10,10,0 ] 
    for(var i = 0; i < 1000; i++) {
        console.log("frame: "+i);
        calcNewDiffFrame(currentDiffFrame, currentRenderFrame, stillSourceFrame, basePalette)
        currentRenderFrame[0] = (currentRenderFrame[0] + basePalette[currentDiffFrame[0]][0]) % 256
        currentRenderFrame[1] = (currentRenderFrame[1] + basePalette[currentDiffFrame[0]][1]) % 256
        currentRenderFrame[2] = (currentRenderFrame[2] + basePalette[currentDiffFrame[0]][2]) % 256
        console.log(currentDiffFrame)
        console.log(currentRenderFrame)
               
    }
})()
*/

// DOM READY - Encode and Decode Test Still Frame:
(function(){
    var basePalette = generateBasePalette();

    // Image sample
    function onVideoPlay(ev) {
        var $this = this;
        
        var imgWidth = ev.target.videoWidth;
        var imgHeight = ev.target.videoHeight;

        // init source
        var sourceCanvas = document.getElementById("sourceImageContainer");
        sourceCanvas.width = imgWidth;
        sourceCanvas.height = imgHeight;
        var sourceCtx = sourceCanvas.getContext("2d");
        sourceCtx.drawImage(ev.target, 0, 0);
        

        // init target
        var targetCanvas = document.getElementById("targetImageContainer");
        targetCanvas.width = imgWidth;
        targetCanvas.height = imgHeight;
        var targetCtx = targetCanvas.getContext("2d");
        targetCtx.drawImage(ev.target, 0, 0);
        targetCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height)

        // init a still frame setup
        var currentDiffFrame = new Array(imgWidth * imgHeight);
        for(var i = 0; i < currentDiffFrame.length; i++) {
            currentDiffFrame[i] = 0;
        }

        var currentRenderFrame = new Array(4 * imgWidth * imgHeight);
        for(var i = 0; i < currentRenderFrame.length; i++) {
            currentRenderFrame[i] = 255; // begin with white
        }

        var sourceFrame = sourceCtx.getImageData(0, 0, imgWidth, imgHeight).data;
        var frame = 0;

        setInterval(function() {
            if (!$this.paused && !$this.ended) {
                sourceCtx.drawImage(ev.target, 0, 0);
                sourceFrame = sourceCtx.getImageData(0, 0, imgWidth, imgHeight).data;

                document.getElementById("frameCounter").innerHTML = ++frame;

                calcNewDiffFrame(currentDiffFrame, currentRenderFrame, sourceFrame, basePalette);
                renderFrame(targetCtx, currentDiffFrame, imgWidth, imgHeight, basePalette);
                currentRenderFrame = targetCtx.getImageData(0, 0, imgWidth, imgHeight).data;
            }
        }, 40);
    }


    var video = document.getElementById('sourceVideo');
    video.addEventListener('play', onVideoPlay, false);

})()
