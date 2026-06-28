import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { Conversation, Message } from '../types';

const Chat = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/conversations').then(({ data }) => setConversations(data.conversations));
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    api.get(`/conversations/${conversationId}/messages`).then(({ data }) => {
      setMessages(data.messages);
    });

    const socket = getSocket();
    if (!socket) return;
    socket.emit('join:conversation', Number(conversationId));

    const onNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };
    const onTypingStart = () => setIsTyping(true);
    const onTypingStop = () => setIsTyping(false);

    socket.on('message:new', onNewMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.emit('leave:conversation', Number(conversationId));
      socket.off('message:new', onNewMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !conversationId) return;
    const socket = getSocket();
    socket?.emit('message:send', { conversationId: Number(conversationId), content });
    setContent('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    const socket = getSocket();
    if (!socket || !conversationId) return;
    socket.emit('typing:start', Number(conversationId));
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => socket.emit('typing:stop', Number(conversationId)), 1500));
  };

  const activeConversation = conversations.find((c) => c.id === Number(conversationId));

  return (
    <div className="page page--chat">
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <h2>Mensajes</h2>
          {conversations.length === 0 && <p className="empty-state">Sin conversaciones</p>}
          {conversations.map((conv) => {
            const otherName = user?.id === conv.buyerId ? conv.sellerName : conv.buyerName;
            return (
              <Link
                key={conv.id}
                to={`/chat/${conv.id}`}
                className={`chat-item ${conv.id === Number(conversationId) ? 'chat-item--active' : ''}`}
              >
                <div className="avatar-placeholder">{(otherName ?? 'U')[0]}</div>
                <div className="chat-item__info">
                  <p className="chat-item__name">{otherName}</p>
                  <p className="chat-item__product">{conv.productTitle}</p>
                  <p className="chat-item__last">{conv.lastMessage ?? 'Sin mensajes'}</p>
                </div>
              </Link>
            );
          })}
        </aside>

        <main className="chat-main">
          {!conversationId ? (
            <div className="chat-empty">Selecciona una conversación</div>
          ) : (
            <>
              <div className="chat-header">
                <h3>
                  {activeConversation
                    ? user?.id === activeConversation.buyerId
                      ? activeConversation.sellerName
                      : activeConversation.buyerName
                    : 'Chat'
                  }
                </h3>
                {activeConversation?.productTitle && (
                  <Link to={`/products/${activeConversation.productId}`} className="chat-product-link">
                    Re: {activeConversation.productTitle}
                  </Link>
                )}
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.senderId === user?.id ? 'message--own' : 'message--other'}`}
                  >
                    <p className="message__content">{msg.content}</p>
                    <span className="message__time">
                      {new Date(msg.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {isTyping && (
                  <div className="message message--other">
                    <p className="message__typing">Escribiendo...</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="chat-input">
                <input
                  type="text"
                  value={content}
                  onChange={handleTyping}
                  placeholder="Escribe un mensaje..."
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" disabled={!content.trim()}>
                  Enviar
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Chat;
