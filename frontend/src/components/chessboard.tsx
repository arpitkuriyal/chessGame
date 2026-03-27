import { Square, PieceSymbol, Color } from "chess.js";
import { useState } from "react";
import { unicodePieces } from "./pieces";

type BoardSquare =
  | { square: Square; type: PieceSymbol; color: Color }
  | null;

type Props = {
  board: BoardSquare[][];
  socket: WebSocket;
  currentTurn: boolean;
  rotateBoard: boolean;
};

export default function Chessboard({
  board,
  socket,
  currentTurn,
  rotateBoard,
}: Props) {
  const [from, setFrom] = useState<Square | null>(null);

  const handleSquareClick = (square: Square, piece: BoardSquare) => {
    if (!from) {
      if (!piece) return;
      setFrom(square);
      return;
    }

    if (!currentTurn) {
      console.warn("Not your turn");
      setFrom(null);
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected");
      setFrom(null);
      return;
    }

    socket.send(
      JSON.stringify({
        type: "make-move",
        move: { from, to: square },
      })
    );

    setFrom(null);
  };

  const getSquareName = (row: number, col: number): Square => {
    return (String.fromCharCode(97 + col) + (8 - row)) as Square;
  };

  return (
    <div className={`${rotateBoard ? "rotate-180" : ""}`}>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center">
          {row.map((square, colIndex) => {
            const squareName = getSquareName(rowIndex, colIndex);
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = from === squareName;

            const piece =
              square && unicodePieces[square.type + square.color];

            return (
              <div
                key={colIndex}
                onClick={() => handleSquareClick(squareName, square)}
                className={`
                  ${isLight ? "bg-green-500" : "bg-green-200"}
                  ${isSelected ? "ring-4 ring-yellow-400" : ""}
                  w-8 h-8 md:w-12 md:h-12 lg:w-20 lg:h-20
                  flex items-center justify-center
                  cursor-pointer
                  transition-all duration-150
                `}
              >
                <div className={rotateBoard ? "rotate-180" : ""}>
                  {piece}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}