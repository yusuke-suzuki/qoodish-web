'use client';

import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { MoreVert, Place } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { DecoratorNode, type NodeKey } from 'lexical';
import { useParams } from 'next/navigation';
import { type JSX, memo, useState } from 'react';
import type { SpotAnchor } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import {
  SPOT_NODE_TYPE,
  type SerializedSpotNode,
  createSerializedSpot
} from '../../utils/chapterContent';
import ChapterNodeMenu from './ChapterNodeMenu';

type SpotViewProps = {
  nodeKey: NodeKey;
  anchor: SpotAnchor;
};

const SpotNodeView = memo(function SpotNodeView({
  nodeKey,
  anchor
}: SpotViewProps) {
  const dictionary = useDictionary();
  const { lang } = useParams<{ lang: string }>();
  const isEditable = useLexicalEditable();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

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

        {isEditable && (
          <IconButton
            size="small"
            aria-label={dictionary.edit}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        )}
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

      {isEditable && (
        <ChapterNodeMenu
          nodeKey={nodeKey}
          anchorEl={menuAnchor}
          onClose={() => setMenuAnchor(null)}
        />
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
    return <SpotNodeView nodeKey={this.getKey()} anchor={this.__anchor} />;
  }
}

export function $createSpotNode(anchor: SpotAnchor): SpotNode {
  return new SpotNode(anchor);
}
