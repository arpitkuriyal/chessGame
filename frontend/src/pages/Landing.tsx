import { useNavigate } from "react-router-dom";
import chessBoard from "../assets/chessboard.png";
import onePiece from "../assets/onePiece.png";
import Header from "../components/header";
import { SignedOut, SignInButton, SignUpButton, useAuth } from "@clerk/clerk-react";

export default function Landing() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-5 md:px-20 py-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 w-full max-w-7xl">
          <div className="flex justify-center w-full lg:w-1/2">
            <img
              src={chessBoard}
              alt="Chess Board"
              className="w-full max-w-md h-auto"
            />
          </div>

          <div className="text-center lg:text-left w-full lg:w-1/2">
            <h1 className="text-4xl md:text-6xl lg:text-8xl text-white font-extrabold py-5">
              Play Chess Online
            </h1>

            {isSignedIn ? (
              <button
                onClick={() => navigate("/game")}
                className="bg-green-700 rounded-md text-xl md:text-3xl lg:text-5xl flex items-center justify-center px-4 py-3 mx-auto lg:mx-0 text-white font-semibold gap-3 hover:bg-green-800 transition-colors"
              >
                <img
                  src={onePiece}
                  alt="Chess Piece"
                  className="w-10 h-12 md:w-12 md:h-16 lg:w-16 lg:h-20"
                />
                Play Online
              </button>
            ) : (
              <div className="flex flex-col gap-4 items-center lg:items-start">
                <SignedOut>
                  <SignInButton>
                    <button className="bg-green-700 px-6 py-3 rounded-md text-white text-lg font-semibold hover:bg-green-800 transition-colors">
                      Login & Play
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="rounded-md border border-white/50 px-6 py-3 text-lg font-semibold text-white hover:bg-white/10">
                      Create account
                    </button>
                  </SignUpButton>
                </SignedOut>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
