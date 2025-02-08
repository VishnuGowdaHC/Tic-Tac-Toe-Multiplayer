const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const path = require('path');



const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server);
app.use(express.static(path.resolve(__dirname, "public")));

let arr = []; //Consists of waiting players for matchup
let playingArray = []; //Consists of currentPlayer who all are playing


io.on("connection", (socket) => {
  
  socket.on("find", (e) => {
    if(e.name != null){
      arr.push(e.name)

      //Add the players in pairs and push the obj into array
      if(arr.length >= 2){
        let gameObj = {
          p1: { p1name: arr[0], p1value: "X" },
          p2: { p2name: arr[1], p2value: "O" },
          board: [  
            ["", "", ""],  
            ["", "", ""],  
            ["", "", ""]  
          ],
          turn: "X"
        }

        playingArray.push(gameObj);
        arr.splice(0, 2);

        io.emit("find", {allPlayers: playingArray});

      }
    }
  });

  function checkWinner(board){
    //Checks rows 
    for(let i = 0; i < 3; i++){
      if(board[i][0] && board[i][0]===board[i][1] && board[i][1]===board[i][2]){
        return board[i][0]; //return X or O
      }
    }
    
    //Checks coloumn
    for(let j = 0; j < 3; j++){
      if(board[0][j] && board[0][j]===board[1][j] && board[1][j]===board[2][j]){
        return board[0][j]; //return X or O
      }
    }

    //Checks diagonal
    if(board[0][0]&&board[0][0]===board[1][1] && board[1][1] === board[2][2]){
      return board[0][0];   //return X or O
    }

    //Checks anti-diagonal
    if(board[0][2]&&board[0][2]===board[1][1] && board[1][1] === board[2][0]){
      return board[0][2];   //return X or O
    } 

    //Convert 2d array into 1d array then checks if its filled 
    return board.flat().includes("") ? null : "draw";
  }

  socket.on("move", ({row, col, player}) => {
    //Find the player from playingArray [] 
    let game = playingArray.find(g => g.p1.p1name === player || g.p2.p2name === player);
    
    //Validate if player exist, if cells filled and player turn
    if (!game) return console.log("Game not found for player:", player);
    if (game.board[row][col] !== "") return console.log("Cell already occupied");
    if ((game.turn === "X" && game.p1.p1name !== player) || (game.turn === "O" && game.p2.p2name !== player)) {
      return console.log("Not this player's turn");
    }

    //Add the symbol into array (by default p1 has X)
    game.board[row][col] = game.p1.p1name === player ? "X" : "O";
    game.turn = game.turn === "X" ? "O" : "X"; //Change turns 
    
    let winner;
    if(checkWinner(game.board) === "X"){
      winner = "X";
    } else if (checkWinner(game.board) === "O"){
      winner = "O";
    } else if (checkWinner(game.board) === "draw") {
      winner = "draw";
    } else {
      winner = null;
    }

    io.emit("updateBoard", {board: game.board, turn: game.turn, result: winner});
  })

  io.emit("playersCount", io.engine.clientsCount);

})



app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
})


server.listen(PORT, () => {
  console.log(`port is connected to ${PORT}`);
})


