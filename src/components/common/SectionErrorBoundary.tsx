'use client';

import { Alert } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import useDictionary from '../../hooks/useDictionary.ts';
import reportClientError from '../../utils/reportClientError.ts';

type BoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type BoundaryState = {
  failed: boolean;
};

class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    reportClientError(error, 'section-boundary');
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type Props = {
  children: ReactNode;
  message?: string;
};

export default function SectionErrorBoundary({ children, message }: Props) {
  const dictionary = useDictionary();

  return (
    <Boundary
      fallback={
        <Alert severity="error">
          {message ?? dictionary['section load failed']}
        </Alert>
      }
    >
      {children}
    </Boundary>
  );
}
