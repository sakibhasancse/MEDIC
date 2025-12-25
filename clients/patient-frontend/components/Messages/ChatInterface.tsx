'use client';

import { Box, Paper, TextField, IconButton, Typography, Avatar, CircularProgress, Fab, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

import { messageAPI } from '@/lib/api';
// ... (imports)

// ... (keep interface Message)

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'doctor',
    content: 'Hello! How are you feeling today?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    isMe: false,
    status: 'read'
  },
  {
    id: '2',
    senderId: 'patient',
    content: 'I am feeling much better, thank you doctor.',
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    isMe: true,
    status: 'read'
  },
  {
    id: '3',
    senderId: 'doctor',
    content: 'That is great to hear. Are you still taking the antibiotics?',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    isMe: false,
    status: 'read'
  }
];

export function ChatInterface({ threadId }: { threadId: string }) {
  const t = useTranslations('messages');
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await messageAPI.getThread(threadId);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        // Fallback to mock data
        setMessages(mockMessages);
      }
    };
    fetchMessages();
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const tempId = Date.now().toString();
    const message: Message = {
      id: tempId,
      senderId: 'patient',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isMe: true,
      status: 'sent'
    };

    // Optimistic update
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    try {
       await messageAPI.send({
         receiverId: threadId, 
         content: message.content
       });
       // In real app, we might update the message status or ID from response
    } catch (error) {
       console.error('Failed to send message:', error);
       // Handle error (maybe mark message as failed)
       
       // Fallback auto-reply for demo
       setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'doctor',
          content: 'Auto-reply: This is a demo. Backend connection failed.',
          timestamp: new Date().toISOString(),
          isMe: false,
          status: 'sent'
        };
        setMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', minHeight: 400 }}>
      {/* Header (optional if page has header) */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <IconButton onClick={() => router.back()} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: 'primary.main' }}>SR</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Dr. Sarah Rahman
          </Typography>
          <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', display: 'inline-block' }} />
            Online
          </Typography>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: msg.isMe ? 'primary.main' : 'white',
                color: msg.isMe ? 'white' : 'text.primary',
                borderRadius: 2,
                borderTopRightRadius: msg.isMe ? 0 : 2,
                borderTopLeftRadius: msg.isMe ? 2 : 0,
                border: msg.isMe ? 'none' : '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="body1">{msg.content}</Typography>
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: msg.isMe ? 'right' : 'left' }}>
              {format(new Date(msg.timestamp), 'h:mm a')}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          gap: 1, 
          alignItems: 'flex-end',
          borderRadius: 0 
        }}
      >
        <IconButton color="primary" aria-label="attach file">
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          placeholder={t('typeMessage')}
          multiline
          maxRows={4}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          size="small"
          aria-label={t('typeMessage')}
          sx={{ 
            bgcolor: 'background.default',
            '& .MuiOutlinedInput-root': {
              borderRadius: 3
            }
          }}
        />
        <Fab 
          color="primary" 
          size="small" 
          onClick={handleSend}
          disabled={!newMessage.trim()}
          sx={{ boxShadow: 'none' }}
          aria-label="send message"
        >
          <SendIcon fontSize="small" />
        </Fab>
      </Paper>
    </Box>
  );
}
