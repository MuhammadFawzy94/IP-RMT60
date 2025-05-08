// import { useState } from 'react';
// import axios from 'axios';
// import { 
//   Container, 
//   Typography, 
//   TextField, 
//   Button, 
//   Paper, 
//   Box, 
//   CircularProgress,
//   Divider,
//   Card,
//   CardContent 
// } from '@mui/material';
// import {ReactMarkdown} from 'react-markdown';
// import SendIcon from '@mui/icons-material/Send';
// import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

// const GeminiAssistant = () => {
//   const [prompt, setPrompt] = useState('');
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [history, setHistory] = useState([]);

//   const API_URL = 'http://localhost:80/api/gemini';

//   const commonPrompts = [
//     "Bagaimana memeriksa dan mengganti oli motor?",
//     "Kenapa motor saya bunyi aneh saat digas?",
//     "Langkah-langkah mengganti busi motor",
//     "Penyebab motor sulit dinyalakan di pagi hari",
//     "Tips merawat rantai motor supaya awet"
//   ];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!prompt.trim()) {
//       setError('Please enter a prompt');
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const result = await axios.get(API_URL, {
//         params: { prompt }
//       });
      
//       const newResponse = result.data.data;
//       setResponse(newResponse);
      
//       // Add to history
//       setHistory((prev) => [
//         ...prev, 
//         { prompt, response: newResponse, timestamp: new Date() }
//       ]);
      
//       // Clear prompt after successful submission
//       setPrompt('');
//     } catch (err) {
//       console.error('Error fetching Gemini response:', err);
//       setError(
//         err.response?.data?.message || 
//         'Failed to get response from Gemini. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container maxWidth="md" sx={{ py: 4 }}>
//       <Box sx={{ textAlign: 'center', mb: 4 }}>
//         <Typography variant="h3" component="h1" gutterBottom>
//           <AutoFixHighIcon fontSize="large" sx={{ mr: 1, verticalAlign: 'middle' }} />
//           Motorcycle AI Assistant
//         </Typography>
//         <Typography variant="body1" color="text.secondary">
//           Ask any question about motorcycle maintenance, troubleshooting, or repairs
//         </Typography>
//       </Box>

//       <Paper 
//         component="form" 
//         onSubmit={handleSubmit} 
//         elevation={3}
//         sx={{ 
//           p: 3, 
//           mb: 4,
//           backgroundColor: '#f8f9fa'
//         }}
//       >
//         <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//           {commonPrompts.map((preset, index) => (
//             <Button 
//               key={index}
//               variant="outlined" 
//               size="small"
//               onClick={() => setPrompt(preset)}
//               sx={{ mt: 1 }}
//             >
//               {preset}
//             </Button>
//           ))}
//         </Box>
        
//         <TextField
//           fullWidth
//           label="Ask about motorcycle problems"
//           variant="outlined"
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           multiline
//           rows={3}
//           placeholder="Example: My motorcycle won't start. What could be the issue?"
//           sx={{ mb: 2 }}
//           error={!!error}
//           helperText={error}
//         />
        
//         <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
//           <Button 
//             type="submit" 
//             variant="contained" 
//             color="primary"
//             disabled={loading}
//             endIcon={<SendIcon />}
//             sx={{ px: 4 }}
//           >
//             {loading ? <CircularProgress size={24} /> : 'Submit'}
//           </Button>
//         </Box>
//       </Paper>

//       {response && (
//         <Paper elevation={3} sx={{ p: 3, mb: 4, backgroundColor: '#f0f7ff' }}>
//           <Typography variant="h6" gutterBottom>
//             AI Response:
//           </Typography>
//           <Box sx={{ 
//             p: 2, 
//             backgroundColor: 'white', 
//             borderRadius: 1,
//             border: '1px solid #e0e0e0'
//           }}>
//             <div className="markdown-content">
//               <ReactMarkdown>{response}</ReactMarkdown>
//             </div>
//           </Box>
//         </Paper>
//       )}

//       {history.length > 0 && (
//         <Box sx={{ mt: 6 }}>
//           <Typography variant="h5" gutterBottom>
//             Previous Questions
//           </Typography>
//           <Divider sx={{ mb: 3 }} />
          
//           {history.slice().reverse().map((item, index) => (
//             <Card key={index} sx={{ mb: 2, backgroundColor: '#fafafa' }}>
//               <CardContent>
//                 <Typography variant="subtitle1" fontWeight="bold">
//                   Q: {item.prompt}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary" display="block">
//                   {new Date(item.timestamp).toLocaleString()}
//                 </Typography>
//                 <Divider sx={{ my: 1 }} />
//                 <Box className="markdown-content">
//                   <ReactMarkdown>{item.response}</ReactMarkdown>
//                 </Box>
//               </CardContent>
//             </Card>
//           ))}
//         </Box>
//       )}
//     </Container>
//   );
// };

// export default GeminiAssistant;