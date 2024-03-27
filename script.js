document.addEventListener('DOMContentLoaded', function() {
    var dropZone = document.getElementById('drop_zone');
    var pitchSlider = document.getElementById('pitchSlider');
    var audioPlayer = document.getElementById('audio_player');
    var audioVisualizer = document.getElementById('audio_visualizer');
    
    // Adjust the canvas width on load
    audioVisualizer.width = dropZone.offsetWidth;
    
    // Setup event listeners
    dropZone.addEventListener('dragover', dragOverHandler);
    dropZone.addEventListener('drop', dropHandler);
    pitchSlider.addEventListener('input', function() {
        // Add relevant pitch control functionality here
        console.log("Pitch adjusted to: " + pitchSlider.value + ". Real-time pitch adjustment is not implemented in this basic example.");
    });

    function dragOverHandler(ev) {
        ev.preventDefault(); // Prevent default behavior (Prevent file from being opened)
    }

    function dropHandler(ev) {
        ev.preventDefault();
        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (var i = 0; i < ev.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (ev.dataTransfer.items[i].kind === 'file') {
                    var file = ev.dataTransfer.items[i].getAsFile();
                    console.log('... file[' + i + '].name = ' + file.name);
                    playAudio(file);
                }
            }
        }
    }

// Existing functions remain unchanged
// Modify the playAudio function and add new functions for granular synthesis

function playAudio(file) {
    var context = new (window.AudioContext || window.webkitAudioContext)();
    var source = context.createBufferSource();
    var pitchControl = document.getElementById('pitchSlider');
    var grainDuration = 0.1; // Duration of each grain in seconds
    var overlapRatio = 0.5; // Overlap between grains

    context.decodeAudioData(file, function(buffer) {
        var duration = buffer.duration;
        var channelData = buffer.getChannelData(0); // Assuming mono audio for simplicity

        // Calculate grain parameters
        var grainSize = Math.floor(grainDuration * context.sampleRate);
        var halfGrainSize = grainSize / 2;
        var numGrains = Math.ceil(duration / grainDuration * overlapRatio);

        // Setup grains
        for (var i = 0; i < numGrains; i++) {
            var grainSource1 = context.createBufferSource();
            var grainSource2 = context.createBufferSource();
            var grainBuffer = context.createBuffer(1, grainSize, context.sampleRate);

            // Fill grainBuffer with audio data
            var offset = i * halfGrainSize;
            if (offset + grainSize > channelData.length) {
                break; // Avoid reading beyond buffer
            }
            grainBuffer.copyToChannel(channelData.subarray(offset, offset + grainSize), 0, 0);

            grainSource1.buffer = grainBuffer;
            grainSource2.buffer = grainBuffer;
            
            // Connect and play grains with phase offset
            grainSource1.connect(context.destination);
            grainSource2.connect(context.destination);
            grainSource1.start(context.currentTime + i * grainDuration * overlapRatio);
            grainSource2.start(context.currentTime + i * grainDuration * overlapRatio + grainDuration * 0.5);

            // Apply pitch control
            grainSource1.playbackRate.value = pitchControl.value;
            grainSource2.playbackRate.value = pitchControl.value;
        }
    });

    // Event listener for the pitch slider
    pitchControl.addEventListener('input', function() {
        // Since we're initiating playback on drop, there's no continuous pitch control applied to ongoing grains.
        // Implementing real-time pitch control on granular synthesis in this setup would require a more complex approach,
        // such as continuously adjusting the playback rate of new grains based on slider input.
        console.log("Pitch adjusted to: " + pitchControl.value + ". Real-time pitch adjustment is not implemented in this basic example.");
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('audio_visualizer');
    canvas.width = document.getElementById('drop_zone').offsetWidth;
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('drop', dropHandler);
    dropZone.addEventListener('dragover', dragOverHandler);
});


function drawWaveform(audioBuffer) {
    var canvas = document.getElementById('audio_visualizer');
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var data = audioBuffer.getChannelData(0); // Use the first channel
    var step = Math.ceil(data.length / width);
    var amp = height / 2;
    
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, amp);
    
    for (var i = 0; i < width; i++) {
        var min = 1.0;
        var max = -1.0;
        for (var j = 0; j < step; j++) {
            var datum = data[(i * step) + j]; 
            if (datum < min)
                min = datum;
            if (datum > max)
                max = datum;
        }
        ctx.lineTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
}

document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('audio_visualizer');
    canvas.width = document.getElementById('drop_zone').offsetWidth;
});