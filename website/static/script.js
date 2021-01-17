let shapes = [];

let minPitch = 100000;
let maxPitch = 0;

let bottomY = 100;
let topY = 0;
let incrementY = 0.2;

let minVelocity = 100000;
let maxVelocity = 0;

const scheme = new ColorScheme;
scheme.from_hue(0)
    .scheme("analogic")
    .variation("default");
let colors = scheme.colors();

let trackInfo;

let NUM_MODEL_FILES = 0;

const MIDI_DIR_PATH = "/static/midi";

const allSongs = [];
let currentSong;

fetch("/api/count")
    .then(response => response.json())
    .then(data => {
        NUM_MODEL_FILES = data.count;

        console.log(`Server has ${NUM_MODEL_FILES} MIDI files.`);

        // call init function after 200ms
        setTimeout(init, 200);
    });

const player = new core.SoundFontPlayer('https://storage.googleapis.com/download.magenta.tensorflow.org/soundfonts_js/salamander');
player.callbackObject = {
    run: function (note, time) {
        const x = canvas.map(note.pitch, minPitch, maxPitch, 0, window.innerWidth);
        const y = canvas.map(0.9, 0, 1, topY, bottomY);
        const radius = canvas.map(note.velocity, minVelocity - 5, maxVelocity + 5, 10, 200);
        const color = `#${colors[canvas.random([1, 2, 3])]}`;
        shapes.push({
            x: x,
            y: y,
            radius: radius,
            color: color
        });
    },
    stop: function () { }
}

let currentSongIndex;
let secondsElapsed, progressInterval;

const canvas = new p5(sketch, document.querySelector('.canvas-container'));

function init() {
    // Event listeners.
    document.getElementById('btnPlay').addEventListener('click', playOrPause);
    document.getElementById('btnHelp').addEventListener('click', toggleHelp);
    document.getElementById('btnCloseHelp').addEventListener('click', toggleHelp);

    document.getElementById('btnNext').addEventListener('click', () => {
        nextSong()
    });
    document.getElementById('btnPrevious').addEventListener('click', () => {
        previousSong();
    });
    document.getElementById('btnSave').addEventListener('click', save);

    const hashSongIndex = window.location.hash.substr(1).trim();

    getSong(hashSongIndex).then(() => changeSong(0, true));
}

async function getSong(songIndex) {
    if (!songIndex) {
        songIndex = getRandomSongIndex();
    }
    const midiPath = `${MIDI_DIR_PATH}/${songIndex}.mid`;
    const infoPath = `${MIDI_DIR_PATH}/${songIndex}.json`;

    currentSong = {};
    allSongs.push(currentSong);

    currentSong.index = songIndex;

    currentSong.midiPath = midiPath;
    currentSong.infoPath = infoPath;

    currentSong.midiFileName = `${songIndex}.mid`;

    await fetch(currentSong.infoPath)
        .then(response => response.json())
        .then(data => {
            currentSong.trackInfo = data;
        });

    const ns = await core.urlToNoteSequence(currentSong.midiPath);
    const quantized = core.sequences.quantizeNoteSequence(ns, 4);
    currentSong.sequence = quantized;
}

/*
 * Event listeners.
 */
function playOrPause() {
    const state = player.getPlayState();
    if (state === 'started') {
        pausePlayer();
    } else {
        startPlayer();
    }
}

function save() {
    window.saveAs(new File([window.core.sequenceProtoToMidi(currentSong.sequence)], currentSong.midiFileName));
}

function toggleHelp() {
    const el = document.querySelector('.splash');
    document.querySelector('.main').hidden = el.hidden;
    el.hidden = !el.hidden;

    const btn = document.getElementById('btnCloseHelp');
    if (btn.textContent === 'close') {
        return;
    } else {
        btn.textContent = 'close';
        startPlayer();
    }
}

/*
 * Helpers.
 */
function pausePlayer(andStop = false) {
    if (andStop) {
        player.stop();
        document.querySelector('.current-time').textContent = '0:00';
        document.querySelector('progress').value = 0;
        secondsElapsed = 0;
    } else {
        player.pause();
    }
    clearInterval(progressInterval);
    progressInterval = null;
    document.getElementById('btnPlay').classList.remove('active');
    // document.querySelector('.album').classList.remove('rotating');
}

function startPlayer() {
    const state = player.getPlayState();
    if (state === 'stopped') {
        secondsElapsed = 0;
        player.start(currentSong.sequence).then(
            () => {
                nextSong();
            });
    } else {
        player.resume();
    }

    clearInterval(progressInterval);
    progressInterval = setInterval(updateProgressBar, 1000);
    document.getElementById('btnPlay').classList.add('active');
    // document.querySelector('.album').classList.add('rotating');
}

function isPlaying() {
    const state = player.getPlayState();
    if (state === 'started') {
        return true;
    } else {
        return false;
    }
}

const progressBar = document.querySelector('progress');
const currentTime = document.querySelector('.current-time');

function updateProgressBar() {
    secondsElapsed++;
    progressBar.value = secondsElapsed;
    currentTime.textContent = formatSeconds(secondsElapsed);
}

// Next/previous should also start the song.
function nextSong() {
    getSong().then(() => changeSong(currentSongIndex + 1));
}

function previousSong() {
    changeSong(currentSongIndex - 1);
}

function changeSong(index, noAutoplay = false) {
    // Update to this song.
    currentSongIndex = index;

    // If this is the first song, we don't get a previous button.
    if (currentSongIndex === 0) {
        document.getElementById('btnPrevious').setAttribute('disabled', true);
    } else {
        document.getElementById('btnPrevious').removeAttribute('disabled');
    }

    pausePlayer(true);

    currentSong = allSongs[index];

    window.location.hash = currentSong.index;

    handleTrackInfo(currentSong.trackInfo);

    canvas.init(currentSong.sequence);

    // Set up the progress bar.
    const seconds = Math.round(currentSong.sequence.totalTime);
    const totalTime = formatSeconds(seconds);
    document.querySelector('.total-time').textContent = totalTime;
    const progressBar = document.querySelector('progress');
    progressBar.max = seconds;
    progressBar.value = 0;

    document.querySelector('.song-title').textContent = currentSong.trackInfo.title;
    document.querySelector('.song-artist').textContent = currentSong.trackInfo.artist;

    // Get ready for playing, and start playing if we need to.
    // This takes the longest so start early.
    player.loadSamples(currentSong.sequence).then(() => {
        if (!noAutoplay) {
            startPlayer();
        }
    });
}

function getRandomSongIndex() {
    const index = Math.floor(Math.random() * NUM_MODEL_FILES - 1) + 1;
    return index;
}

// From https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds.
function formatSeconds(s) {
    s = Math.round(s);
    return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
}

function handleTrackInfo(trackInfo) {
    scheme.from_hue(trackInfo.hue)
        .scheme("analogic")
        .variation("default");

    colors = scheme.colors();

    canvas.randomSeed(trackInfo.random_seed);
}

function sketch(p) {
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.rectMode(p.CENTER);
    };

    p.draw = function () {
        const playing = isPlaying();

        if (playing) {
            bottomY += incrementY;
            topY += incrementY;

            for (const shape of shapes) {
                shape.radius = shape.radius * 0.998;
            }
        }

        p.background(`#${colors[0]}`);

        p.stroke(0);
        p.strokeWeight(1);

        for (const shape of shapes) {
            p.fill(shape.color);
            if ((shape.y + shape.radius) >= topY && (shape.y - shape.radius) <= bottomY) {
                p.circle(shape.x, p.map(shape.y, topY, bottomY, 0, window.innerHeight), shape.radius);
            }
        }

        const lineY = canvas.map(0.9, 0, 1, 0, window.innerHeight);
        p.stroke(0);
        p.strokeWeight(2);
        p.line(0, lineY, window.innerWidth, lineY);
    }

    p.init = function (ns) {
        shapes = [];

        minPitch = 100000;
        maxPitch = 0;

        minVelocity = 100000;
        maxVelocity = 0;

        for (let i = 0; i < ns.notes.length; i++) {
            const note = ns.notes[i];

            if (note.pitch < minPitch) {
                minPitch = note.pitch;
            }
            if (note.pitch > maxPitch) {
                maxPitch = note.pitch;
            }

            if (note.velocity < minVelocity) {
                minVelocity = note.velocity;
            }
            if (note.velocity > maxVelocity) {
                maxVelocity = note.velocity;
            }
        }
    }
};
