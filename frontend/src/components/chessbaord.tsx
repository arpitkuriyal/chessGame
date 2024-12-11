import { Chess } from "chess.js"
export default function Chessboard(){
    const board=new Chess().board()
    

    return (
        <>{board.map((row,rowIndex)=>{
            console.log(row)
            return <div key={rowIndex} className="flex justify-center ">
                
            {row.map((square,squareIndex)=>{
                const iswhite=(rowIndex+squareIndex)%2===0;
                return <div key={squareIndex} className={ ` ${iswhite ? "bg-green-500": "bg-green-200"  } lg:w-20 lg:h-20 md:w-12 md:h-12 w-8 h-8 border flex hover:cursor-pointer hover:border-black`}>
                    <div className="m-auto">{square? square.type:""}</div>
                </div>
            })}
            </div>
        })}</>
    )
    
}