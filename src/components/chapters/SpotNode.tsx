'use client';

import { Place } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { DecoratorNode, type NodeKey } from 'lexical';
import { useParams } from 'next/navigation';
import { type JSX, memo } from 'react';
import type { SpotAnchor } from '../../../types';
import {
  SPOT_NODE_TYPE,
  type SerializedSpotNode,
  createSerializedSpot
} from '../../utils/chapterContent';

const SpotNodeView = memo(function SpotNodeView({
  anchor
}: {
  anchor: SpotAnchor;
}) {
  const { lang } = useParams<{ lang: string }>();

  const timeLabel = anchor.checked_in_at
    ? new Date(anchor.checked_in_at).toLocaleString(lang, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <Box sx={{ mt: 4, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Place color="primary" sx={{ mt: 0.5 }} />

        <Typography
          variant="h5"
          component="h2"
          sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}
        >
          {anchor.name}
        </Typography>
      </Box>

      {timeLabel && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', ml: 4 }}
        >
          {timeLabel}
        </Typography>
      )}
    </Box>
  );
});

export class SpotNode extends DecoratorNode<JSX.Element> {
  __anchor: SpotAnchor;

  static getType(): string {
    return SPOT_NODE_TYPE;
  }

  static clone(node: SpotNode): SpotNode {
    return new SpotNode(node.__anchor, node.__key);
  }

  static importJSON(serializedNode: SerializedSpotNode): SpotNode {
    return new SpotNode({
      review_id: serializedNode.review_id,
      name: serializedNode.name,
      latitude: serializedNode.latitude,
      longitude: serializedNode.longitude,
      checked_in_at: serializedNode.checked_in_at
    });
  }

  constructor(anchor: SpotAnchor, key?: NodeKey) {
    super(key);
    this.__anchor = anchor;
  }

  exportJSON(): SerializedSpotNode {
    return createSerializedSpot(this.__anchor);
  }

  createDOM(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'journal-spot';
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <SpotNodeView anchor={this.__anchor} />;
  }
}

export function $createSpotNode(anchor: SpotAnchor): SpotNode {
  return new SpotNode(anchor);
}
