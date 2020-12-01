function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
    console.log('createAudioMeter')

    const processor = audioContext.createScriptProcessor(512)
    processor.onaudioprocess = volumeAudioProcess
    processor.clipping = false
    processor.lastClip = 0
    processor.volume = 0
    processor.clipLevel = clipLevel || 0.98
    processor.averaging = averaging || 0.95
    processor.clipLag = clipLag || 750
    processor.connect(audioContext.destination)
    processor.checkClipping = function () {
        if (!this.clipping) {
            return false
        }
        if ((this.lastClip + this.clipLag) < window.performance.now()) {
            this.clipping = false
        }
        return this.clipping
    }

    processor.shutdown = function () {
        this.disconnect()
        this.onaudioprocess = null
    }

    return processor
}

function volumeAudioProcess(event) {
    const buf = event.inputBuffer.getChannelData(0)
    const bufLength = buf.length
    let sum = 0
    let x
    for (var i = 0; i < bufLength; i++) {
        x = buf[i]
        if (Math.abs(x) >= this.clipLevel) {
            this.clipping = true
            this.lastClip = window.performance.now()
        }
        sum += x * x
    }
    const rms = Math.sqrt(sum / bufLength)
    this.volume = Math.max(rms, this.volume * this.averaging).toFixed(2)

    document.getElementById('audio-value').innerHTML = this.volume
    if (this.volume > 0.1) {
        if (typeof video === 'undefined') {
            document.getElementById('is-speaking').innerText = "SPEAKING";
        } else {
            video.classList.add('voice-on');
        }
    } else {
        if (typeof video === 'undefined') {

            document.getElementById('is-speaking').innerText = "";
        } else {
            video.classList.remove('voice-on');
            this.volume = 0;
        }
    }
}