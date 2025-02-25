import type { Components } from 'react-markdown';
import { Box } from '@mui/material';

export const RemarkQuote: Components['blockquote'] = ({ children }) => (
  <Box
    component="blockquote"
    sx={{
      color: 'text.secondary',
      fontDisplay: 'swap',
      fontFamily: 'Libre Baskerville, serif',
      fontStyle: 'italic',
      pl: 2,
      position: 'relative',
      '&:before': {
        bgcolor: 'secondary.main',
        borderRadius: '4px',
        content: '""',
        display: 'block',
        height: 1,
        left: 0,
        position: 'absolute',
        width: 4,
      },
      '> *': {
        fontDisplay: 'inherit',
        fontFamily: 'inherit',
      },
    }}
  >
    {children}
  </Box>
);
