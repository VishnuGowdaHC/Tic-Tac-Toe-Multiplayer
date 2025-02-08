document.getElementById("role").style.display="none";
document.getElementById("valueCont").style.display="none";
document.getElementById("whosTurn").style.display="none";
document.getElementById("boardCont").style.display="none";
document.getElementById("result").style.display="none";
document.getElementById("draw").style.display="none";

const socket = io();
let playerName;

document.getElementById("playBtn").addEventListener("click", () => {
  playerName = document.getElementById("userName").value;
  document.getElementById("user").innerText = playerName;

  if(playerName === null || playerName === ''){
    alert("Enter Your Name");
  } else {
    socket.emit("find", {name: playerName});

    document.getElementById("playBtn").disabled=true;
  }
})

socket.on("find", (e) => {
  let allPlayersArray = e.allPlayers;
  console.log(allPlayersArray)

  document.getElementById("role").style.display="flex";
  document.getElementById("valueCont").style.display="block";
  document.getElementById("whosTurn").style.display="block";
  document.getElementById("whosTurn").innerText = "X's Turn";
  document.getElementById("boardCont").style.display="block";
  document.getElementById("userName").style.display="none";
  document.getElementById("playBtn").style.display="none";

  let oppName;
  let value;

  const foundObj = allPlayersArray.find(obj => obj.p1.p1name === playerName || obj.p2.p2name === playerName);

  if (foundObj.p1.p1name === playerName) {
      oppName = foundObj.p2.p2name;
      value = foundObj.p1.p1value;
  } else {
      oppName = foundObj.p1.p1name;
      value = foundObj.p2.p2value;
  }

  document.getElementById("opponent").innerText=oppName;
  document.getElementById("value").innerText=value;
})


socket.on("updateBoard", ({board, turn, result}) => {
  console.log("Board update received:", board, "Next turn:", turn);

  document.getElementById("whosTurn").innerText = turn + "'s turn'";

  for(let i = 0; i < 3; i++){
    for(let j = 0; j < 3; j++){
      document.getElementById(`cell-${i}-${j}`).innerText = board[i][j];
    }
  }

  const winHTML = document.getElementById("result");
  const drawHTML = document.getElementById("draw");
  
  if (result === "X" || result === "O") {
      winHTML.style.display = "block";
      winHTML.innerText = `${result} is the WINNER! 🍾`;
      drawHTML.style.display = "none"; 
  } else if (result === "draw") {
      drawHTML.style.display = "block";
      winHTML.style.display = "none";  
  } else {
      drawHTML.style.display = "none";
      winHTML.style.display = "none";
  }
})

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener("click", () => {
    let [row, col] = btn.id.split("-").slice(1).map(Number);
    console.log(`Move event sent: Row ${row}, Col ${col}, Player: ${playerName}`);
    socket.emit("move", {row, col, player: playerName});
  })
})