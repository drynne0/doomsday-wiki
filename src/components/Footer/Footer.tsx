import type { FunctionComponent, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { Link } from '@/components/Link/Link';
import { darkTheme } from '@/theme/theme';

interface Props {
  isClear: boolean;
  sx?: SxProps<Theme>;
}

export const Footer: FunctionComponent<Props> = ({ isClear, sx }) => {
  const footer: ReactNode = (
    <Box
      component="footer"
      sx={[
        { color: 'text.secondary', textAlign: 'center' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography component="p" variant="caption">
        Copyright &copy; 2017-2023 Doomsday Wiki contributors. Read the notice
        about <Link href="/license">licenses and resources</Link>.
      </Typography>
      <Typography component="p" variant="caption">
        This page collects anonymous analytics through Vercel. See their
        GDPR-compliant{' '}
        <Link href="https://vercel.com/legal/privacy-policy">
          privacy policy
        </Link>
        .
      </Typography>
    </Box>
  );
  return isClear ? (
    <MuiThemeProvider theme={darkTheme}>{footer}</MuiThemeProvider>
  ) : (
    footer
  );
};
