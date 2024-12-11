
import Chessboard from "../components/chessbaord";
import useSocket from "../hooks/useSocket";

export default function Game() {
  const socket = useSocket("ws://localhost:8080");

  const handlePlayClick = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Message sent: join-queue");
      socket.send(
        JSON.stringify({
          type: "join-queue",
        })
      );
    } else {
      console.error("WebSocket is not open. Unable to send message.");
      alert("Connection not ready. Please try again.");
    }
  };

  return (
    <div className="mt-10 flex justify-center items-center flex-col">
      <div className="mb-6">
        <Chessboard />
      </div>
      <button
        className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
        onClick={handlePlayClick}
      >
        Play
      </button>
    </div>
  );
}
