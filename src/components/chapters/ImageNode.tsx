'use client';

import { Box } from '@mui/material';
import { DecoratorNode, type NodeKey } from 'lexical';
import { type JSX, memo, useRef } from 'react';
import {
  type ChapterImage,
  createSerializedImage,
  IMAGE_NODE_TYPE,
  type SerializedImageNode
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
  const imageRef = useRef<HTMLImageElement>(null);
  const { selected } = useBlockSelection(nodeKey, imageRef);

  return (
    <Box sx={{ my: 2 }}>
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
