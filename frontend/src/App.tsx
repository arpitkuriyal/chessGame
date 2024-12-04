import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [input,setInput] = useState<string>("")
  const [messages,setMessages]=useState<string[]>([])
  const[socket,setSocket]=useState<WebSocket | null>(null)

  useEffect(()=>{
    const socket =new WebSocket("ws://localhost:8080")
    setSocket(socket)

    socket.onopen=()=>{
      console.log("connection started")
    }
    socket.onmessage=(event)=>{
      setMessages((prev)=>[...prev,event.data])
    }
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = () => console.log("WebSocket closed!");
    },[])
    const sendMessages=(messages: string)=>{
      if(socket?.readyState===WebSocket.OPEN){
        socket.send(messages)
      }
    }
    console.log(messages)

  return (
    <div>
      <input onChange={(e)=>{
        setInput(e.target.value)
      }} placeholder='write your message here'
      type='text'
      value={input}>

      </input>
      <button onClick={()=>{sendMessages(input),setInput('')}}>send</button>
      <ul>
      {messages.map((msg,index)=>{
        return <li key={index}>{msg}</li>
      })}
      </ul>
      
    </div>
  )
}

export default App
