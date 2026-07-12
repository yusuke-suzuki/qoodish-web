'use client';

import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { MoreVert, Place } from '@mui/icons-material';
import { Box, CardMedia, IconButton, Paper, Typography } from '@mui/material';
import { DecoratorNode, type NodeKey } from 'lexical';
import { useParams } from 'next/navigation';
import { type JSX, createContext, memo, useContext, useState } from 'react';
import type { Review, SpotAnchor } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import {
  SPOT_NODE_TYPE,
  type SerializedSpotNode,
  createSerializedSpot
} from '../../utils/chapterContent';
import ChapterNodeMenu from './ChapterNodeMenu';

export const ChapterReviewsContext = createContext<Review[]>([]);

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
  const reviews = useContext(ChapterReviewsContext);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const image = reviews.find((review) => review.id === anchor.review_id)
    ?.images[0]?.card;

  const timeLabel = anchor.checked_in_at
    ? new Date(anchor.checked_in_at).toLocaleString(lang, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        my: 4
      }}
    >
      <Paper
        elevation={3}
        square
        sx={{
          p: 1.5,
          pb: 1,
          width: '100%',
          maxWidth: 360,
          bgcolor: 'background.paper'
        }}
      >
        {image ? (
          <CardMedia
            component="img"
            image={image}
            alt={anchor.name}
            sx={{ aspectRatio: '4 / 3', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              aspectRatio: '4 / 3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              color: 'text.disabled'
            }}
          >
            <Place fontSize="large" />
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 1,
            mt: 1.5,
            mb: 0.5
          }}
        >
          <Typography
            variant="subtitle1"
            component="h3"
            fontWeight={600}
            noWrap
            sx={{ flex: 1, minWidth: 0, fontStyle: 'italic' }}
          >
            {anchor.name}
          </Typography>

          {timeLabel && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ flexShrink: 0 }}
            >
              {timeLabel}
            </Typography>
          )}

          {isEditable && (
            <IconButton
              size="small"
              aria-label={dictionary.edit}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              sx={{ alignSelf: 'center', mr: -0.5 }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Paper>

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
