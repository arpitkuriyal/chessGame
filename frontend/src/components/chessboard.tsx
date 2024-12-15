import { Square, PieceSymbol, Color } from "chess.js";
import { useState } from "react";

const unicodePieces: { [key: string]: string } = {
  "pw": "♙",  // white pawn
  "rw": "♖",  // white rook
  "nw": "♘",  // white knight
  "bw": "♗",  // white bishop
  "qw": "♕",  // white queen
  "kw": "♔",  // white king
  "pb": "♟︎", // black pawn
  "rb": "♜",  // black rook
  "nb": "♞",  // black knight
  "bb": "♝",  // black bishop
  "qb": "♛",  // black queen
  "kb": "♚",  // black king
};

export default function Chessboard({
  setBoard,
  chess,
  board,
  socket,
  currentTurn,
  rotateBoard
}: {
  setBoard: any;
  chess: any;
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  socket: WebSocket;
  currentTurn: any;
  rotateBoard:boolean
}) {
  const [from, setFrom] = useState<null | Square>(null);


  const handleSquareClick = (squareRepresentation: Square) => {

    if (!from) {
      // Select the square to move from
      setFrom(squareRepresentation);
    } else {
      try {
        // Validate current turn
        if (currentTurn) {
          console.warn("It's not your turn.");
          
          setFrom(null);
          return;
        }

        
        // Attempt the move
        const moveResult = chess.move({ from, to: squareRepresentation });

        if (!moveResult) {
          console.error("Invalid move:", { from, to: squareRepresentation });
          setFrom(null);
          return;
        }

        // Send the move to the server
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "make-move",
              move: {
                from,
                to: squareRepresentation,
              },
            })
          );
        } else {
          console.error("WebSocket not open. Move not sent.");
        }

        // Update the board state
        setBoard(chess.board());
        setFrom(null);
      } catch (error) {
        console.error("An error occurred during the move:", error);
        setFrom(null);
      }
    }
  };

  return (
    <div
    className={`${
      rotateBoard ? "transform rotate-180" : ""
    } transition-transform duration-300`} // Rotate if rotateBoard is true
  >
      {board.map((row, rowIndex) => {
        return (
          <div key={rowIndex} className="flex justify-center">
            {row.map((square, squareIndex) => {
              const squareRepresentation = String.fromCharCode(97 + (squareIndex % 8)) + (8 - rowIndex) as Square;
              const isWhite = (rowIndex + squareIndex) % 2 === 0;
              const pieceType = square ? unicodePieces[square.type + square.color] : null;

              return (
                <div
                  onClick={() => handleSquareClick(squareRepresentation)}
                  key={squareIndex}
                  className={`${
                    isWhite ? "bg-green-500" : "bg-green-200"
                  } lg:w-20 lg:h-20 md:w-12 md:h-12 w-8 h-8 border flex hover:cursor-pointer hover:border-black`}
                >
                  <div className={`${
      rotateBoard ? "transform rotate-180" : ""
    } transition-transform duration-300 m-auto`} >{pieceType}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
