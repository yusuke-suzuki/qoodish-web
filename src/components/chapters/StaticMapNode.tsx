'use client';

import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { Delete } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { DecoratorNode, type NodeKey } from 'lexical';
import { type JSX, memo, useRef } from 'react';
import useDictionary from '../../hooks/useDictionary';
import {
  STATIC_MAP_NODE_TYPE,
  type SerializedStaticMapNode,
  createSerializedStaticMap
} from '../../utils/chapterContent';
import staticMapUrl from '../../utils/staticMapUrl';
import useBlockSelection from './useBlockSelection';

type StaticMapViewProps = {
  nodeKey: NodeKey;
  latitude: number;
  longitude: number;
};

const StaticMapNodeView = memo(function StaticMapNodeView({
  nodeKey,
  latitude,
  longitude
}: StaticMapViewProps) {
  const dictionary = useDictionary();
  const isEditable = useLexicalEditable();

  const imageRef = useRef<HTMLImageElement>(null);
  const { selected, remove } = useBlockSelection(nodeKey, imageRef);

  const image = (
    <Box
      component="img"
      ref={imageRef}
      src={staticMapUrl(latitude, longitude, { width: 640, height: 360 })}
      alt=""
      loading="lazy"
      sx={{
        display: 'block',
        width: '100%',
        aspectRatio: '16 / 9',
        objectFit: 'cover',
        borderRadius: 1,
        outline: selected ? '2px solid' : 'none',
        outlineColor: 'primary.main',
        outlineOffset: '2px'
      }}
    />
  );

  return (
    <Box sx={{ position: 'relative', my: 2 }}>
      {isEditable ? (
        image
      ) : (
        <Box
          component="a"
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noreferrer"
          sx={{ display: 'block' }}
        >
          {image}
        </Box>
      )}

      {selected && (
        <IconButton
          size="small"
          aria-label={dictionary.delete}
          onClick={remove}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'common.white',
            bgcolor: 'rgba(0, 0, 0, 0.55)',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
});

export class StaticMapNode extends DecoratorNode<JSX.Element> {
  __latitude: number;
  __longitude: number;

  static getType(): string {
    return STATIC_MAP_NODE_TYPE;
  }

  static clone(node: StaticMapNode): StaticMapNode {
    return new StaticMapNode(node.__latitude, node.__longitude, node.__key);
  }

  static importJSON(serializedNode: SerializedStaticMapNode): StaticMapNode {
    return new StaticMapNode(serializedNode.latitude, serializedNode.longitude);
  }

  constructor(latitude: number, longitude: number, key?: NodeKey) {
    super(key);
    this.__latitude = latitude;
    this.__longitude = longitude;
  }

  exportJSON(): SerializedStaticMapNode {
    return createSerializedStaticMap(this.__latitude, this.__longitude);
  }

  createDOM(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'journal-static-map';
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <StaticMapNodeView
        nodeKey={this.getKey()}
        latitude={this.__latitude}
        longitude={this.__longitude}
      />
    );
  }
}

export function $createStaticMapNode(
  latitude: number,
  longitude: number
): StaticMapNode {
  return new StaticMapNode(latitude, longitude);
}
