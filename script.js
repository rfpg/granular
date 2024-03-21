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
