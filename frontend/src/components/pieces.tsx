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

export const unicodePieces: { [key: string]: JSX.Element } = {
  pw: <img src={pw} alt="White Pawn"/>,  
  rw: <img src={rw} alt="White Rook" />,   
  nw: <img src={nw} alt="White Knight" />, 
  bw: <img src={bw} alt="White Bishop" />, 
  qw: <img src={qw} alt="White Queen" />, 
  kw: <img src={kw} alt="White King" />,   
  pb: <img src={pb} alt="Black Pawn" />,   
  rb: <img src={rb} alt="Black Rook" />,   
  nb: <img src={nb} alt="Black Knight" />, 
  bb: <img src={bb} alt="Black Bishop" />, 
  qb: <img src={qb} alt="Black Queen" />, 
  kb: <img src={kb} alt="Black King" />,   
};
