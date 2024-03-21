document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let audioBufferSourceNode = null;
    let audioBuffer = null;

    const dropZone = document.getElementById('drop_zone');
    const pitchSlider = document.getElementById('pitchSlider');

    function handleFileSelect(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            audioContext.decodeAudioData(event.target.result, function(buffer) {
                audioBuffer = buffer;
                playAudio(buffer);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function playAudio(buffer) {
        if (audioBufferSourceNode) {
            audioBufferSourceNode.stop();
        }
        audioBufferSourceNode = audioContext.createBufferSource();
        audioBufferSourceNode.buffer = buffer;
        audioBufferSourceNode.connect(audioContext.destination);
        audioBufferSourceNode.start(0);
    }

    function adjustPitch() {
        if (!audioBuffer) return;
        // Creating a new buffer source node for pitch adjustment, since the playbackRate
        // cannot be adjusted on a node that has already started playing.
        const playbackRate = pitchSlider.value;
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.playbackRate.value = playbackRate;
        sourceNode.connect(audioContext.destination);
        if (audioBufferSourceNode) {
            audioBufferSourceNode.stop();
        }
        audioBufferSourceNode = sourceNode;
        audioBufferSourceNode.start(0);
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

    pitchSlider.addEventListener('input', adjustPitch);
});
