import React, { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Bot, Check, ChevronRight, MessageCircle, Plus, Send, Sparkles, UserRound } from 'lucide-react'
import styles from './Style/ChatPage.module.css'

const chatBaseUrl = import.meta.env.VITE_CHAT_API_URL || `${import.meta.env.VITE_BASE_URL}/api/chat`
const quickPrompts = ['Explain a difficult concept', 'Help me study for an exam', 'Give me a step-by-step solution']

const getAIResponse = async (prompt) => {
  if (window.puter?.ai?.chat) {
    const response = await window.puter.ai.chat([
      { role: 'system', content: 'You are StudyBot, a helpful and encouraging AI tutor. Explain topics clearly, use examples, and guide the learner step by step.' },
      { role: 'user', content: prompt }
    ], { model: 'gpt-4o-mini', temperature: 0.7, max_tokens: 1000 })
    if (typeof response === 'string') return response
    return response?.message?.content || response?.message || response?.content || response?.text || response?.choices?.[0]?.message?.content || 'I could not read that response. Please try again.'
  }

  return 'StudyBot is not connected right now. Please check your connection and try again.'
}

const getOtherParticipant = (conversation) => conversation?.participants?.find((person) => String(person._id) !== String(localStorage.getItem('userId')))

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState('assistant')
  const [assistantMessages, setAssistantMessages] = useState([])
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const assistantEndRef = useRef(null)
  const messagesEndRef = useRef(null)
  const token = localStorage.getItem('token')

  const loadConversations = async () => {
    if (!token) return
    setLoadingConversations(true)
    setError('')
    try {
      const response = await fetch(`${chatBaseUrl}/conversations`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error('Unable to load your conversations.')
      const data = await response.json()
      setConversations(Array.isArray(data) ? data : [])
      setUnreadCount((await fetch(`${chatBaseUrl}/unread-count`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.ok ? res.json() : { unreadCount: 0 })).unreadCount || 0)
    } catch (err) {
      setError(err.message || 'Unable to load your conversations.')
    } finally {
      setLoadingConversations(false)
    }
  }

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation || !token) return
      setLoadingMessages(true)
      setError('')
      try {
        const response = await fetch(`${chatBaseUrl}/messages/${selectedConversation._id}`, { headers: { Authorization: `Bearer ${token}` } })
        if (!response.ok) throw new Error('Unable to load messages for this conversation.')
        setMessages(await response.json())
      } catch (err) {
        setError(err.message || 'Unable to load messages.')
      } finally {
        setLoadingMessages(false)
      }
    }
    loadMessages()
  }, [selectedConversation, token])

  useEffect(() => {
    assistantEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [assistantMessages, assistantLoading])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendAssistantMessage = async (text = assistantInput) => {
    const question = text.trim()
    if (!question || assistantLoading) return
    const userMessage = { id: `${Date.now()}-user`, text: question, sender: 'user', time: new Date() }
    setAssistantMessages((current) => [...current, userMessage])
    setAssistantInput('')
    setAssistantLoading(true)
    try {
      const answer = await getAIResponse(question)
      setAssistantMessages((current) => [...current, { id: `${Date.now()}-bot`, text: answer, sender: 'bot', time: new Date() }])
    } catch {
      setAssistantMessages((current) => [...current, { id: `${Date.now()}-error`, text: 'I’m having trouble reaching the assistant. Please try again in a moment.', sender: 'bot', time: new Date() }])
    } finally {
      setAssistantLoading(false)
    }
  }

  const sendPropertyMessage = async (event) => {
    event.preventDefault()
    const text = messageInput.trim()
    if (!text || !selectedConversation || sendingMessage) return
    setSendingMessage(true)
    setError('')
    try {
      const response = await fetch(`${chatBaseUrl}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId: selectedConversation._id, text })
      })
      if (!response.ok) throw new Error('Message could not be sent.')
      const newMessage = await response.json()
      setMessages((current) => [...current, newMessage])
      setMessageInput('')
      loadConversations()
    } catch (err) {
      setError(err.message || 'Message could not be sent.')
    } finally {
      setSendingMessage(false)
    }
  }

  const startNewAssistantChat = () => setAssistantMessages([])
  const formatTime = (value) => value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div><span className={styles.eyebrow}><Sparkles size={14} /> YOUR CONVERSATION SPACE</span><h1>Chat</h1><p>Get a little help from AI or pick up with a buyer or seller.</p></div>
        <div className={styles.tabs} role="tablist" aria-label="Chat type">
          <button type="button" role="tab" aria-selected={activeTab === 'assistant'} className={activeTab === 'assistant' ? styles.activeTab : ''} onClick={() => setActiveTab('assistant')}><Bot size={17} /> StudyBot</button>
          <button type="button" role="tab" aria-selected={activeTab === 'property'} className={activeTab === 'property' ? styles.activeTab : ''} onClick={() => setActiveTab('property')}><MessageCircle size={17} /> Property chats{unreadCount > 0 && <span className={styles.unread}>{unreadCount}</span>}</button>
        </div>
      </header>

      {error && <div className={styles.error} role="alert">{error}</div>}

      {activeTab === 'assistant' ? (
        <section className={styles.assistant}>
          <div className={styles.chatHeader}><div className={styles.botIcon}><Bot size={20} /></div><div><strong>StudyBot</strong><span><i /> AI study companion</span></div><button type="button" className={styles.newChat} onClick={startNewAssistantChat}><Plus size={16} /> New chat</button></div>
          <div className={styles.assistantBody}>
            {assistantMessages.length === 0 ? <div className={styles.welcome}>
              <div className={styles.welcomeIcon}><Sparkles size={26} /></div><h2>What would you like to learn?</h2><p>Ask a question, work through a tricky topic, or get a clear explanation.</p>
              <div className={styles.quickPrompts}>{quickPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => sendAssistantMessage(prompt)}>{prompt}<ChevronRight size={15} /></button>)}</div>
            </div> : <div className={styles.transcript}>
              {assistantMessages.map((message) => <div key={message.id} className={`${styles.turn} ${message.sender === 'user' ? styles.userTurn : ''}`}><div className={styles.avatar}>{message.sender === 'user' ? <UserRound size={16} /> : <Bot size={16} />}</div><div className={styles.bubble}><strong>{message.sender === 'user' ? 'You' : 'StudyBot'}</strong><p>{message.text}</p><time>{formatTime(message.time)}</time></div></div>)}
              {assistantLoading && <div className={styles.turn}><div className={styles.avatar}><Bot size={16} /></div><div className={`${styles.bubble} ${styles.thinking}`}><span /><span /><span /> StudyBot is thinking</div></div>}
              <div ref={assistantEndRef} />
            </div>}
          </div>
          <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); sendAssistantMessage() }}><textarea value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendAssistantMessage() } }} placeholder="Ask StudyBot anything…" rows={1} disabled={assistantLoading} /><button type="submit" disabled={!assistantInput.trim() || assistantLoading} aria-label="Send message"><Send size={17} /></button><small>Enter to send · Shift + Enter for a new line</small></form>
          <div className={styles.privacy}><Check size={14} /> StudyBot uses Puter AI when available. Avoid sharing personal or sensitive information.</div>
        </section>
      ) : (
        <section className={styles.propertyChat}>
          <aside className={styles.conversationList}>
            <div className={styles.conversationHeading}><div><strong>Your conversations</strong><span>Buyer and seller messages</span></div><button type="button" onClick={loadConversations} aria-label="Refresh conversations"><ArrowUpRight size={16} /></button></div>
            {!token ? <div className={styles.emptyState}>Log in to view your property conversations.</div> : loadingConversations ? <div className={styles.emptyState}>Loading conversations…</div> : conversations.length === 0 ? <div className={styles.emptyState}>No messages yet. Contact a property owner to start a conversation.</div> : conversations.map((conversation) => {
              const other = getOtherParticipant(conversation)
              return <button key={conversation._id} type="button" onClick={() => setSelectedConversation(conversation)} className={`${styles.conversation} ${selectedConversation?._id === conversation._id ? styles.selectedConversation : ''}`}><span className={styles.personAvatar}>{other?.name?.[0]?.toUpperCase() || 'U'}</span><span className={styles.conversationText}><strong>{other?.name || 'Marketplace member'}</strong><small>{conversation.property?.title || conversation.lastMessage || 'Open conversation'}</small></span><ChevronRight size={15} /></button>
            })}
          </aside>
          <div className={styles.messagePane}>
            {!selectedConversation ? <div className={styles.emptyPane}><div className={styles.welcomeIcon}><MessageCircle size={24} /></div><h2>Select a conversation</h2><p>Your property inquiries and replies will appear here.</p></div> : <>
              <div className={styles.messageHeader}><span className={styles.personAvatar}>{getOtherParticipant(selectedConversation)?.name?.[0]?.toUpperCase() || 'U'}</span><div><strong>{getOtherParticipant(selectedConversation)?.name || 'Marketplace member'}</strong><span>{selectedConversation.property?.title || 'Real estate conversation'}</span></div></div>
              <div className={styles.messageHistory}>
                {loadingMessages ? <div className={styles.emptyState}>Loading messages…</div> : messages.length === 0 ? <div className={styles.emptyState}>Say hello to start the conversation.</div> : messages.map((message) => {
                  const mine = String(message.sender?._id || message.sender) === String(localStorage.getItem('userId'))
                  return <div key={message._id} className={`${styles.messageRow} ${mine ? styles.mine : ''}`}><div className={styles.messageBubble}><p>{message.text}</p><time>{formatTime(message.createdAt)}</time></div></div>
                })}<div ref={messagesEndRef} />
              </div>
              <form className={styles.messageComposer} onSubmit={sendPropertyMessage}><input value={messageInput} onChange={(event) => setMessageInput(event.target.value)} placeholder="Write a message…" /><button type="submit" disabled={!messageInput.trim() || sendingMessage} aria-label="Send message"><Send size={17} /></button></form>
            </>}
          </div>
        </section>
      )}
    </main>
  )
}

export default ChatPage
