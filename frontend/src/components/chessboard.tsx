import { Square, PieceSymbol, Color } from "chess.js";
import { useState } from "react";
import kb from "../assets/kb.svg"
import bb from '../assets/bb.svg'
import bw from '../assets/bw.svg'
import rb from '../assets/rb.svg'
import rw from '../assets/rw.svg'
import kw from '../assets/kw.svg'
import qb from '../assets/qb.svg'
import qw from '../assets/qw.svg'
import pb from '../assets/pb.svg'
import pw from '../assets/pw.svg'
import nw from '../assets/nw.svg'
import nb from '../assets/nb.svg'

const unicodePieces: { [key: string]: JSX.Element } = {
  pw: <img src={pw} alt="White Pawn"/>,   // white pawn
  rw: <img src={rw} alt="White Rook" />,   // white rook
  nw: <img src={nw} alt="White Knight" />, // white knight
  bw: <img src={bw} alt="White Bishop" />, // white bishop
  qw: <img src={qw} alt="White Queen" />, // white queen
  kw: <img src={kw} alt="White King" />,   // white king
  pb: <img src={pb} alt="Black Pawn" />,   // black pawn
  rb: <img src={rb} alt="Black Rook" />,   // black rook
  nb: <img src={nb} alt="Black Knight" />, // black knight
  bb: <img src={bb} alt="Black Bishop" />, // black bishop
  qb: <img src={qb} alt="Black Queen" />, // black queen
  kb: <img src={kb} alt="Black King" />,   // black king
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
    }  m-auto duration-[1ms]`} >{pieceType}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
