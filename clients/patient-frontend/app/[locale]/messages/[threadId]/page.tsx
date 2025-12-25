import { ChatInterface } from '@/components/Messages/ChatInterface';
import { Container, Box } from '@mui/material';

export default async function ChatPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="md" sx={{ flex: 1, py: 2, display: 'flex', flexDirection: 'column' }}>
        <ChatInterface threadId={threadId} />
      </Container>
    </Box>
  );
}
