'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatSystem.module.css';

const mockContacts = {
  admin: [
    { id: 1, name: 'John Smith', role: 'Dept Manager', department: 'Roads', online: true, avatar: 'J' },
    { id: 2, name: 'Sarah Johnson', role: 'Dept Manager', department: 'Water Supply', online: true, avatar: 'S' },
    { id: 3, name: 'Mike Davis', role: 'Dept Manager', department: 'Electricity', online: false, avatar: 'M' },
    { id: 4, name: 'Emily Brown', role: 'Dept Manager', department: 'Sanitation', online: true, avatar: 'E' },
  ],
  'dept-manager': [
    { id: 5, name: 'Admin Office', role: 'Super Admin', department: 'Admin', online: true, avatar: 'A' },
    { id: 6, name: 'Raj Kumar', role: 'Field Officer', department: 'Same Dept', online: true, avatar: 'R' },
    { id: 7, name: 'Priya Sharma', role: 'Field Officer', department: 'Same Dept', online: false, avatar: 'P' },
    { id: 8, name: 'Amit Singh', role: 'Field Officer', department: 'Same Dept', online: true, avatar: 'A' },
  ],
  'field-officer': [
    { id: 9, name: 'Dept Manager', role: 'Department Manager', department: 'Your Dept', online: true, avatar: 'D' },
    { id: 10, name: 'Team Group', role: 'Group Chat', department: 'Your Dept', online: true, avatar: 'T', isGroup: true },
  ],
};

const mockMessages = {
  1: [
    { id: 1, sender: 'John Smith', text: 'Hi, we have 5 pending road repair issues in Ward 3.', time: '10:30 AM', isMe: false },
    { id: 2, sender: 'Me', text: 'Thanks for the update. What is the priority order?', time: '10:32 AM', isMe: true },
    { id: 3, sender: 'John Smith', text: 'Main Street pothole is urgent. Assigning additional resources.', time: '10:35 AM', isMe: false },
  ],
  5: [
    { id: 1, sender: 'Admin Office', text: 'Monthly targets have been updated. Please check.', time: '9:00 AM', isMe: false },
    { id: 2, sender: 'Me', text: 'Received. Will review and acknowledge.', time: '9:15 AM', isMe: true },
  ],
  9: [
    { id: 1, sender: 'Dept Manager', text: 'New task assigned: Check water leakage at Block B.', time: '8:00 AM', isMe: false },
    { id: 2, sender: 'Me', text: 'On it. Will update once I reach the location.', time: '8:05 AM', isMe: true },
    { id: 3, sender: 'Me', text: 'Reached the location. Issue is more severe than reported.', time: '9:30 AM', isMe: true },
    { id: 4, sender: 'Dept Manager', text: 'Understood. Do you need additional support?', time: '9:32 AM', isMe: false },
  ],
};

export default function ChatSystem({ user }: { user: any }) {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<Record<number, any[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contacts = mockContacts[user?.role as keyof typeof mockContacts] || mockContacts.admin;

  useEffect(() => {
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const newMsg = {
      id: Date.now(),
      sender: 'Me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }));
    setNewMessage('');
  };

  const filteredContacts = contacts.filter((contact: any) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = () => {
    if (user?.role === 'admin') return '#16a34a';
    if (user?.role === 'dept-manager' || user?.role === 'field-officer') return '#ea580c';
    return '#2563eb';
  };

  return (
    <div className={styles.chatContainer}>
      {/* Contacts Sidebar */}
      <div className={styles.contactsSidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Messages</h3>
          <button className={styles.newChatBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <div className={styles.searchBox}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.contactsList}>
          {filteredContacts.map((contact: any) => (
            <button
              key={contact.id}
              className={`${styles.contactItem} ${selectedContact?.id === contact.id ? styles.active : ''}`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className={styles.contactAvatar} style={{ background: getRoleColor() }}>
                {contact.avatar}
                {contact.online && <span className={styles.onlineIndicator}></span>}
              </div>
              <div className={styles.contactInfo}>
                <span className={styles.contactName}>{contact.name}</span>
                <span className={styles.contactRole}>{contact.role} - {contact.department}</span>
              </div>
              {messages[contact.id]?.length > 0 && (
                <span className={styles.unreadBadge}>
                  {messages[contact.id].filter((m) => !m.isMe).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {selectedContact ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                <div className={styles.contactAvatar} style={{ background: getRoleColor() }}>
                  {selectedContact.avatar}
                  {selectedContact.online && <span className={styles.onlineIndicator}></span>}
                </div>
                <div>
                  <h4>{selectedContact.name}</h4>
                  <span className={styles.chatStatus}>
                    {selectedContact.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className={styles.chatHeaderActions}>
                <button className={styles.actionBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </button>
                <button className={styles.actionBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.messagesContainer}>
              {(messages[selectedContact.id] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${msg.isMe ? styles.myMessage : styles.theirMessage}`}
                >
                  <div className={styles.messageContent}>
                    <p>{msg.text}</p>
                    <span className={styles.messageTime}>{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.messageInput} onSubmit={handleSendMessage}>
              <button type="button" className={styles.attachBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className={styles.sendBtn} disabled={!newMessage.trim()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className={styles.noChatSelected}>
            <div className={styles.noChatIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Select a conversation</h3>
            <p>Choose a contact from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
