import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import newRequest from "../utils/newRequest";
import useAuthStore from "../store/authStore";

let socket;

export default function Message() {
  const { id } = useParams();
  const { currentUser } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef(null);

  const { data: conversation } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => newRequest.get(`/conversations/single/${id}`).then((res) => res.data),
  });

  const { data: fetchedMessages } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => newRequest.get(`/messages/${id}`).then((res) => res.data),
  });

  useEffect(() => {
    if (fetchedMessages) setMessages(fetchedMessages);
  }, [fetchedMessages]);

  // Socket.io setup
  useEffect(() => {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    socket.emit("addUser", currentUser._id);

    socket.on("getMessage", ({ senderId, text }) => {
      setArrivalMessage({ userId: senderId, desc: text, createdAt: Date.now() });
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (arrivalMessage) {
      const isParticipant = conversation &&
        (arrivalMessage.userId === conversation.sellerId || arrivalMessage.userId === conversation.buyerId);
      if (isParticipant) setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, conversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    try {
      const res = await newRequest.post("/messages", {
        conversationId: id,
        desc: newMsg,
      });
      const receiverId = currentUser.isSeller ? conversation?.buyerId : conversation?.sellerId;
      socket.emit("sendMessage", { senderId: currentUser._id, receiverId, text: newMsg });
      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-0 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 flex flex-col flex-1 py-6">
        {/* Chat header */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            💬
          </div>
          <div>
            <p className="font-bold text-secondary">Chat</p>
            <p className="text-xs text-gray-400">Conversation #{id.substring(0, 8)}...</p>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white border-x border-gray-100 flex-1 overflow-y-auto p-6 space-y-4 min-h-96 max-h-[60vh]">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-10">
              <p>No messages yet. Say hello! 👋</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isOwn = msg.userId === currentUser._id;
            return (
              <div key={i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-secondary rounded-bl-sm"
                }`}>
                  <p>{msg.desc}</p>
                  <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef}></div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm p-4">
          <div className="flex gap-3">
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send)"
              rows={2}
              className="input-field resize-none flex-1 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!newMsg.trim()}
              className="btn-primary px-6 self-end disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
