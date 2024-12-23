import Auth from "./auth";

export default function Header(){
    return (
        <div className="flex justify-between mx-24 items-center">
            <div className="font-bold text-xl">
                ChessGame.com
            </div>
            <Auth/>
        </div>
    )
}