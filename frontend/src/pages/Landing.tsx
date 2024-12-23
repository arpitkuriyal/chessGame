import { useNavigate } from "react-router-dom";
import chessBoard from "../assets/chessboard.png";
import onePiece from "../assets/onePiece.png";
import Header from "../components/header";
import {  SignedOut, SignInButton,useAuth } from "@clerk/clerk-react";
export default function Landing() {
  const navigate = useNavigate();
  const  {isSignedIn} =useAuth()

  return (

  <div>
    <Header/>
    <div className="bg-zinc-800 w-full h-screen flex flex-col items-center justify-center gap-10 px-5 md:px-20">
      <div className="flex flex-col lg:flex-row items-center gap-10 w-full">
        <div className="flex justify-center w-full lg:w-1/2">
          <img src={chessBoard} alt="Chess Board" className="w-full max-w-md h-auto" />
        </div>
        <div className="text-center lg:text-left w-full lg:w-1/2">
          <h1 className="text-4xl md:text-6xl lg:text-8xl  text-white font-extrabold py-5">
            Play Chess Online
          </h1>
          
          {isSignedIn?<button
    onClick={()=>{
      navigate('/game')
    }}
    className="bg-green-700 rounded-md text-xl md:text-3xl lg:text-5xl flex items-center justify-center px-4 py-3 mx-auto lg:mx-0 text-white font-semibold gap-3 hover:bg-green-800 transition-colors"
  >
    <img src={onePiece} alt="One Piece" className="w-10 h-12 md:w-12 md:h-16 lg:w-16 lg:h-20 " />
    Play Online
  </button> :<header className="bg-green-700 rounded-md text-xl md:text-3xl lg:text-5xl flex items-center justify-center px-4 py-3 mx-auto lg:mx-0 text-white font-semibold gap-3 hover:bg-green-800 transition-colors">
<SignedOut>
  <SignInButton>Play chess online</SignInButton>
</SignedOut>
</header>}
        </div>
      </div>
    </div>
  </div>
  );
}
