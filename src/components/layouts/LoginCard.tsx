import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { getAnalytics, logEvent } from 'firebase/analytics';
import {
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  getAuth
} from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import useDictionary from '../../hooks/useDictionary';

export default memo(function LoginCard() {
  const dictionary = useDictionary();
  const router = useRouter();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const uiRef = useRef<HTMLDivElement>(null);

  const ui = useMemo(() => {
    const auth = getAuth();

    const authUi = firebaseui.auth.AuthUI.getInstance();
    return authUi ? authUi : new firebaseui.auth.AuthUI(auth);
  }, []);

  const handleSignInSuccess = useCallback(
    (authResult: any, redirectUrl: string) => {
      const currentUser = authResult.user;

      currentUser.getIdToken().then((accessToken) => {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${accessToken}`);

        const request = new Request(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/users`,
          {
            method: 'POST',
            headers: headers
          }
        );

        fetch(request)
          .then((res) => {
            if (res.ok) {
              enqueueSnackbar(dictionary['sign in success'], {
                variant: 'success'
              });

              const analytics = getAnalytics();

              logEvent(analytics, 'login', {
                method: authResult.additionalUserInfo.providerId
              });

              router.push(redirectUrl || '/');
            } else {
              res.json().then((body) => {
                enqueueSnackbar(body.detail, { variant: 'error' });
              });
            }
          })
          .catch((_error) => {
            enqueueSnackbar(dictionary['an error occured'], {
              variant: 'error'
            });
          });
      });

      return true;
    },
    [dictionary]
  );

  const uiConfig: firebaseui.auth.Config = useMemo(() => {
    return {
      callbacks: {
        signInSuccessWithAuthResult: handleSignInSuccess
      },
      signInFlow: 'popup',
      signInSuccessUrl: '/',
      signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        {
          provider: FacebookAuthProvider.PROVIDER_ID,
          scopes: ['public_profile', 'email']
        },
        TwitterAuthProvider.PROVIDER_ID,
        GithubAuthProvider.PROVIDER_ID
      ],
      tosUrl: '/terms',
      privacyPolicyUrl: '/privacy'
    };
  }, [handleSignInSuccess]);

  const startUi = useCallback(() => {
    if (uiRef.current) {
      ui.start(uiRef.current, uiConfig);
    }
  }, [ui, uiConfig]);

  useEffect(() => {
    startUi();
  }, [startUi]);

  return (
    <Grid container spacing={mdUp ? 0 : 2}>
      <Grid item xs={12} md={6}>
        <Typography
          variant={mdUp ? 'h3' : 'h4'}
          component="h1"
          color="white"
          align={mdUp ? 'left' : 'center'}
        >
          {dictionary['create map together']}
        </Typography>

        <Typography
          variant={mdUp ? 'subtitle1' : 'subtitle2'}
          component="p"
          color="white"
          align={mdUp ? 'left' : 'center'}
        >
          {dictionary['start new adventure']}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box ref={uiRef} />
      </Grid>
    </Grid>
  );
});
