document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let grainDuration = 0.1; // Duration of each grain in seconds
    let overlap = 0.5; // Overlap factor for grains
    let pitch = 1; // Playback rate (pitch control)

    const dropZone = document.getElementById('drop_zone');
    const pitchSlider = document.getElementById('pitchSlider');

    pitchSlider.addEventListener('input', () => {
        pitch = pitchSlider.value;
    });

    function scheduleGrain(audioBuffer, time) {
        const grainSource = audioContext.createBufferSource();
        grainSource.buffer = audioBuffer;

        const grainGain = audioContext.createGain();
        grainSource.connect(grainGain);
        grainGain.connect(audioContext.destination);

        grainSource.playbackRate.value = pitch;

        // Simple gain envelope for the grain
        grainGain.gain.setValueAtTime(0, time);
        grainGain.gain.linearRampToValueAtTime(1, time + grainDuration * 0.5);
        grainGain.gain.linearRampToValueAtTime(0, time + grainDuration);

        grainSource.start(time);
        grainSource.stop(time + grainDuration);
    }

    function playGrains(audioBuffer) {
        const duration = audioBuffer.duration;
        let currentTime = audioContext.currentTime + 0.1; // Start playback in 100ms

        // Calculate and schedule grains
        while (currentTime < audioContext.currentTime + duration) {
            scheduleGrain(audioBuffer, currentTime);
            // Schedule the next grain, taking into account the overlap
            currentTime += grainDuration * (1 - overlap);
        }
    }

    function handleFileSelect(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            audioContext.decodeAudioData(event.target.result)
            .then((audioBuffer) => {
                playGrains(audioBuffer);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});
