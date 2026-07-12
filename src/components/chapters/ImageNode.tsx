'use client';

import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { MoreVert } from '@mui/icons-material';
import { Box, CardMedia, IconButton, Paper } from '@mui/material';
import { DecoratorNode, type NodeKey } from 'lexical';
import { type JSX, memo, useState } from 'react';
import useDictionary from '../../hooks/useDictionary';
import {
  type ChapterImage,
  IMAGE_NODE_TYPE,
  type SerializedImageNode,
  createSerializedImage
} from '../../utils/chapterContent';
import ChapterNodeMenu from './ChapterNodeMenu';

type ImageViewProps = {
  nodeKey: NodeKey;
  image: ChapterImage;
};

const ImageNodeView = memo(function ImageNodeView({
  nodeKey,
  image
}: ImageViewProps) {
  const dictionary = useDictionary();
  const isEditable = useLexicalEditable();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <Paper
        elevation={3}
        square
        sx={{
          position: 'relative',
          p: 1.5,
          width: '100%',
          maxWidth: 360,
          bgcolor: 'background.paper'
        }}
      >
        <CardMedia
          component="img"
          image={image.hero}
          alt=""
          sx={{ display: 'block', width: '100%' }}
        />

        {isEditable && (
          <>
            <IconButton
              size="small"
              aria-label={dictionary.edit}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.paper' }
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>

            <ChapterNodeMenu
              nodeKey={nodeKey}
              anchorEl={menuAnchor}
              onClose={() => setMenuAnchor(null)}
            />
          </>
        )}
      </Paper>
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
