import { Square, PieceSymbol, Color } from "chess.js";
import { useState } from "react";

export default function Chessboard({
  setBoard,
  chess,
  board,
  socket,
}: {
  setBoard: any;
  chess: any;
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  socket: WebSocket;
}) {
  const [from, setFrom] = useState<null | Square>(null);

  const handleSquareClick = (squareRepresentation: Square) => {
    if (!from) {
      // Select the square to move from
      setFrom(squareRepresentation);
    } else {
      // Perform the move
      const moveResult = chess.move({ from, to: squareRepresentation });
      try{
        if (moveResult) {
          socket.send(
            JSON.stringify({
              type: "make-move",
              move: {
                from,
                to: squareRepresentation,
              },
            })
          );
        }
        setFrom(null);
        setBoard(chess.board());
      }
      catch{
        alert("invalid move")
        setBoard(null)
      }
    }
  };

  return (
    <>
      {board.map((row, rowIndex) => {
        return (
          <div key={rowIndex} className="flex justify-center">
            {row.map((square, squareIndex) => {
              const squareRepresentation = String.fromCharCode(97 + (squareIndex % 8)) + (8 - rowIndex);
              const isWhite = (rowIndex + squareIndex) % 2 === 0;

              return (
                <div
                  onClick={() => handleSquareClick(squareRepresentation as Square)}
                  key={squareIndex}
                  className={`${
                    isWhite ? "bg-green-500" : "bg-green-200"
                  } lg:w-20 lg:h-20 md:w-12 md:h-12 w-8 h-8 border flex hover:cursor-pointer hover:border-black`}
                >
                  <div className="m-auto">{square ? square.type : ""}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}


