import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import chessBoard from "../assets/chessboard.png";
import onePiece from "../assets/onePiece.png";
import Header from "../components/header";
import { SignedOut, SignInButton, useAuth } from "@clerk/clerk-react";

export default function Landing() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const isGuest = localStorage.getItem("guest");

    if (window.location.pathname === "/game") {
      if (!isSignedIn && !isGuest) {
        navigate("/");
      }
    }
  }, [isSignedIn, navigate]);

  const handleGuestPlay = () => {
    const guestId = `guest-${crypto.randomUUID()}`;
    localStorage.setItem("guest", "true");
    localStorage.setItem("guestId", guestId);
    navigate("/game");
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />

      {/* College Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 py-3 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-white text-xl md:text-3xl font-bold">
            College of Technology, Pantnagar
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            Department of Computer Engineering
          </p>
        </div>
      </div>

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

            <p className="text-zinc-300 text-lg md:text-xl mb-8">
              Multiplayer Chess Platform developed as a project under the
              Earn While Learn Scheme.
            </p>

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
                </SignedOut>

                <button
                  onClick={handleGuestPlay}
                  className="bg-blue-600 px-6 py-3 rounded-md text-white text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Play as Guest
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Team Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-700 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-center text-white font-bold text-xl mb-6">
            Project Submitted By
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center">
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white font-semibold">Arun Dutt</p>
              <p className="text-zinc-400 text-sm">ID: 58777</p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white font-semibold">Arpit Kuriyal</p>
              <p className="text-zinc-400 text-sm">ID: 58776</p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white font-semibold">Priyam Joshi</p>
              <p className="text-zinc-400 text-sm">ID: 58887</p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white font-semibold">Shubhrat Shailwal</p>
              <p className="text-zinc-400 text-sm">ID: 59464</p>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white font-semibold">Tanishq Goswami</p>
              <p className="text-zinc-400 text-sm">ID: 59351</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Multiplayer Chess Game
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              Department of Computer Engineering • College of Technology,
              Govind Ballabh Pant University of Agriculture & Technology,
              Pantnagar
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}