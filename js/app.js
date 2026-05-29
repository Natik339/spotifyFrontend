let currSong = new Audio();
let play = document.querySelector('#play');
let previous = document.querySelector('#previous');
let next = document.querySelector('#next');
let songs = [];
let currfolder;
let cardContainer = document.querySelector(".cardContainer");

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function getSongs(folder) {
    currfolder = folder;
    
    let folderKey = folder.split("/")[1] || folder; 
    
    songs = albumData[folderKey] ? albumData[folderKey].songs : [];

    let songUL = document.querySelector('.songList').getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
        `
        <li>
            <img class="invert" src="./img/music.svg">
            <div class="info">
               <div>${song.replaceAll("%20", " ")}</div>
               <div>Natik</div>
            </div>
            <div class="playnow">
              <span>Play Now</span>
              <img class="invert" src="./img/play.svg" alt="">
            </div>
        </li>
        `;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName('li')).forEach((e) => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currSong.src = `./${currfolder}/` + track;
    if (!pause) {
        currSong.play().catch(err => console.log("Playback interaction blocked or file missing:", err));
        play.src = "./img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    cardContainer.innerHTML = ""; 
    
    for (const folder in albumData) {
        let response = albumData[folder];
        
        cardContainer.innerHTML = cardContainer.innerHTML + `
        <div data-folder="${folder}" class="card">
          <div class="play"><i class="fa-solid fa-play play-icon"></i></div>
          <img src="./songs/${folder}/cover.jpg" alt="${response.title} Cover" />
          <h2>${response.title}</h2>
          <p>${response.description}</p>
        </div>`;
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}

async function main() {
    await getSongs("songs/ncs");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    displayAlbums();

    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play().catch(err => console.log(err));
            play.src = "./img/pause.svg";
        } else {
            currSong.pause();
            play.src = "./img/play.svg";
        }
    });

    currSong.addEventListener("timeupdate", () => {
        document.querySelector('.songtime').innerHTML = `${formatTime(currSong.currentTime)} / ${formatTime(currSong.duration)}`;
        let progressPercent = (currSong.currentTime / currSong.duration) * 100;
        document.querySelector(".circle").style.left = (isNaN(progressPercent) ? 0 : progressPercent) + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = percent + "%";
        currSong.currentTime = (currSong.duration * percent) / 100;
    });

    document.querySelector('.hamburger').addEventListener("click", () => {
        document.querySelector('.left').style.left = "0";
    });

    document.querySelector('.close').addEventListener("click", () => {
        document.querySelector('.left').style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let currentTrackName = currSong.src.split("/").slice(-1)[0].replaceAll("%20", " ");
        let idx = songs.indexOf(currentTrackName);
        if (idx - 1 >= 0) {
            playMusic(songs[idx - 1]);
        }
    });

    next.addEventListener("click", () => {
        let currentTrackName = currSong.src.split("/").slice(-1)[0].replaceAll("%20", " ");
        let idx = songs.indexOf(currentTrackName);
        if (idx !== -1 && idx + 1 < songs.length) {
            playMusic(songs[idx + 1]);
        }
    });

    document.querySelector('.range').getElementsByTagName("input")[0].addEventListener("input", (e) => {
        currSong.volume = (e.target.value / 100);
    });

    let lastVolume = 1; 
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        let rangeInput = document.querySelector('.range input');

        if (e.target.src.includes("volume.svg")) {
            lastVolume = currSong.volume; 
            e.target.src = e.target.src.replace('volume.svg', 'mute.svg');
            currSong.volume = 0;
            rangeInput.value = 0;
        } else {
            currSong.volume = lastVolume > 0 ? lastVolume : 0.5;
            rangeInput.value = currSong.volume * 100;
            e.target.src = e.target.src.replace('mute.svg', 'volume.svg');
        }
    });
}

main();
