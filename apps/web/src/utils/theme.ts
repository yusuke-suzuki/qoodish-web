import { createTheme } from '@mui/material';
import { amber, lightBlue } from '@mui/material/colors';
import { enUS, jaJP } from '@mui/material/locale';
import { DARK_BACKGROUND } from './brand.ts';

export function createAppTheme(lang: string) {
  const locale = lang === 'ja' ? jaJP : enUS;

  return createTheme(
    {
      cssVariables: true,
      colorSchemes: {
        light: {
          palette: {
            // Only main is named, so that light, dark and contrastText are
            // derived from it: this amber reads 1.79:1 against white, and MUI
            // answers with dark text on it at 11.70:1. Naming white here
            // instead would put 1.79:1 type on every button.
            primary: {
              main: amber[600]
            },
            // 800 rather than 500, which carried a white label at only 2.63:1;
            // this takes one at 4.80:1.
            secondary: {
              main: lightBlue[800]
            }
          }
        },
        dark: {
          palette: {
            primary: {
              main: amber[600]
            },
            secondary: {
              main: lightBlue[300]
            },
            background: {
              default: DARK_BACKGROUND
            }
          }
        }
      },
      shape: {
        borderRadius: 12
      },
      typography: {
        fontFamily:
          'var(--font-shippori-mincho), "Hiragino Mincho ProN", "Yu Mincho", serif',
        h1: {
          fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
        },
        h2: {
          fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
        },
        h3: {
          fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
        },
        h4: {
          fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
        },
        h5: {
          fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
        },
        h6: {
          fontFamily: 'var(--font-cinzel), var(--font-shippori-mincho), serif'
        },
        body1: {
          lineHeight: 1.9,
          letterSpacing: '0.01em'
        },
        body2: {
          lineHeight: 1.8,
          letterSpacing: '0.01em'
        }
      },
      components: {
        MuiCard: {
          // The page and the card share one surface, so a card needs an edge
          // rather than a shadow to be told from it.
          defaultProps: {
            variant: 'outlined'
          }
        },
        MuiDialog: {
          defaultProps: {
            fullWidth: true
          }
        },
        MuiDrawer: {
          styleOverrides: {
            paperAnchorBottom: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16
            }
          }
        }
      }
    },
    locale
  );
}
