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
  isTurn
}: {
  setBoard: any;
  chess: any;
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  socket: WebSocket;
  currentTurn: any;
  isTurn:boolean
}) {
  const [from, setFrom] = useState<null | Square>(null);

  const handleSquareClick = (squareRepresentation: Square) => {
    console.log(isTurn)
    if (!isTurn) {
      alert("It's not your turn!"); // Alert if it's not the player's turn
      return;
    }
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

        // Validate the move
        const legalMoves = chess.moves({ square: from });
        if (!legalMoves.includes(squareRepresentation)) {
          console.error("Illegal move attempted:", { from, squareRepresentation });
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
    <>
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
                  <div className="m-auto">{pieceType}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
