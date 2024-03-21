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

function playAudio(file) {
    var url = URL.createObjectURL(file);
    var audio = document.getElementById('audio_player');
    audio.src = url;
    audio.play();
    
    var context = new (window.AudioContext || window.webkitAudioContext)();
    var source = context.createBufferSource();
    var reader = new FileReader();
    reader.onload = function(ev) {
        context.decodeAudioData(ev.target.result, function(buffer) {
            drawWaveform(buffer);
        });
    };
    reader.readAsArrayBuffer(file);
}

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
