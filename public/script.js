const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
let findOp = document.getElementById("find_opp")

myVideo.muted = true;

const user = prompt("Enter your name");

document.getElementById("player-name").innerText  = `Your Name: ${user}`

var peer = new Peer({
  host: '127.0.0.1',
  port: 3030,
  path: '/peerjs',
  config: {
    'iceServers': [
      { url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }
    ]
  },

  debug: 3
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log('someone call me');
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => {
  console.log('my id is' + id);
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

socket.on("createMessage", (message, userName) => {
  var time = new Date();
  let cur_time = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <span ${userName===user ? "class=outgoing" 
       : "class=incoming"}>${message}  <span class="time"> ${cur_time} <span></span>
       
    </div>`;
});




myTurn = true, symbol;
let arr=[];
var matches = ['XXX', 'OOO'];


function getBoardState() {
    var obj = {};
    $('.cell').each(function () {
        obj[$(this).attr('id')] = $(this).text() || '';
    });

    console.log("state: ", obj);
    return obj;
}

function isGameOver() {
    var state = getBoardState();
    console.log("Board State: ", state);
    var rows = [
        state.a0 + state.a1 + state.a2,
        state.b0 + state.b1 + state.b2,
        state.c0 + state.c1 + state.c2,
        state.a0 + state.b1 + state.c2,
        state.a2 + state.b1 + state.c0,
        state.a0 + state.b0 + state.c0,
        state.a1 + state.b1 + state.c1,
        state.a2 + state.b2 + state.c2
    ];
    for (var i = 0; i < rows.length; i++) {
        if (rows[i] === matches[0] || rows[i] === matches[1]) {
            return true;
        }
    }
    return false;
}

function renderTurnMessage() {
  if(arr.length == 9){
    $('#messages').text('Game Draw');
  }else{
     if (!myTurn) {
      $('#messages').text('Your opponent\'s turn');
      $('.cell').attr('disabled', true);
  } else {
      $('#messages').text('Your turn.');
      $('.cell').removeAttr('disabled');
    }
  }
   
}
function makeMove(e) {
    e.preventDefault();
    if (!myTurn) {
        return;
    }
    if ($(this).text().length) {
        return;
    }
    socket.emit('make.move', {
        symbol: symbol,
        position: $(this).attr('id')
    });
}
socket.on('move.made', function (data) {
    $('#' + data.position).text(data.symbol);
    arr.push(data);
    myTurn = (data.symbol !== symbol);
    if (!isGameOver()) {
        return renderTurnMessage(arr);
    }
    if (myTurn) {
        $('#messages').text('Game over. You lost.');
    } else {
        $('#messages').text('Game over. You won!');
    }
    $('.cell').attr('disabled', true);
});
socket.on('game.begin', function (data) {

  findOp.style.display = "none"
    $("#symbol").html(data.symbol);
    symbol = data.symbol;
    console.log(symbol)
    myTurn = (data.symbol === 'X');
    renderTurnMessage();
});
socket.on('opponent.left', function () {
    findOp.style.display="block";
    $('#messages').text('Your opponent left the game.');
    $('.cell').attr('disabled', true);
});

$(function () {
    $('.board button').attr('disabled', true);
    $(".cell").on("click", makeMove);
});

$(function (){
  $('.board button').attr('disabled', false);
  $("#find_opp").on("click",linkFind);
});

function linkFind(){
   prompt(
    "Copy this link and send it to people you want to play with",
    window.location.href
  );
}
