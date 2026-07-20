'use client';

import { Delete } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { DecoratorNode, type NodeKey } from 'lexical';
import { type JSX, memo, useRef } from 'react';
import useDictionary from '../../hooks/useDictionary';
import {
  type ChapterImage,
  IMAGE_NODE_TYPE,
  type SerializedImageNode,
  createSerializedImage
} from '../../utils/chapterContent';
import useBlockSelection from './useBlockSelection';

type ImageViewProps = {
  nodeKey: NodeKey;
  image: ChapterImage;
};

const ImageNodeView = memo(function ImageNodeView({
  nodeKey,
  image
}: ImageViewProps) {
  const dictionary = useDictionary();

  const imageRef = useRef<HTMLImageElement>(null);
  const { selected, remove } = useBlockSelection(nodeKey, imageRef);

  return (
    <Box sx={{ position: 'relative', my: 2 }}>
      <Box
        component="img"
        ref={imageRef}
        src={image.hero}
        alt=""
        sx={{
          display: 'block',
          width: '100%',
          borderRadius: 1,
          outline: selected ? '2px solid' : 'none',
          outlineColor: 'primary.main',
          outlineOffset: '2px'
        }}
      />

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

export class ImageNode extends DecoratorNode<JSX.Element> {
  __image: ChapterImage;

  static getType(): string {
    return IMAGE_NODE_TYPE;
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__image, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return new ImageNode({
      image_id: serializedNode.image_id,
      url: serializedNode.url,
      hero: serializedNode.hero
    });
  }

  constructor(image: ChapterImage, key?: NodeKey) {
    super(key);
    this.__image = image;
  }

  exportJSON(): SerializedImageNode {
    return createSerializedImage(this.__image);
  }

  createDOM(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'journal-image';
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <ImageNodeView nodeKey={this.getKey()} image={this.__image} />;
  }
}

export function $createImageNode(image: ChapterImage): ImageNode {
  return new ImageNode(image);
}
