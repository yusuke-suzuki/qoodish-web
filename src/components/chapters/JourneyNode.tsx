'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Box } from '@mui/material';
import { $nodesOfType, DecoratorNode, type NodeKey } from 'lexical';
import { useParams } from 'next/navigation';
import { type JSX, memo, useMemo } from 'react';
import type { JourneyPathPoint } from '../../../types';
import {
  JOURNEY_NODE_TYPE,
  type SerializedJourneyNode,
  createSerializedJourney
} from '../../utils/chapterContent';
import JourneyMap from '../journeys/JourneyMap';
import { SpotNode } from './SpotNode';

type JourneyViewProps = {
  path: JourneyPathPoint[];
};

const JourneyNodeView = memo(function JourneyNodeView({
  path
}: JourneyViewProps) {
  const { lang } = useParams<{ lang: string }>();
  const [editor] = useLexicalComposerContext();

  const spots = useMemo(
    () =>
      editor.getEditorState().read(() =>
        $nodesOfType(SpotNode).map((node) => {
          const anchor = node.exportJSON();

          return {
            name: anchor.name,
            latitude: anchor.latitude,
            longitude: anchor.longitude
          };
        })
      ),
    [editor]
  );

  return (
    <Box sx={{ borderRadius: 1, overflow: 'hidden', my: 3 }}>
      <JourneyMap spots={spots} path={path} locale={lang} />
    </Box>
  );
});

export class JourneyNode extends DecoratorNode<JSX.Element> {
  __journeyId: number | null;
  __path: JourneyPathPoint[];

  static getType(): string {
    return JOURNEY_NODE_TYPE;
  }

  static clone(node: JourneyNode): JourneyNode {
    return new JourneyNode(node.__journeyId, node.__path, node.__key);
  }

  static importJSON(serializedNode: SerializedJourneyNode): JourneyNode {
    return new JourneyNode(
      serializedNode.journey_id,
      serializedNode.path ?? []
    );
  }

  constructor(
    journeyId: number | null,
    path: JourneyPathPoint[],
    key?: NodeKey
  ) {
    super(key);
    this.__journeyId = journeyId;
    this.__path = path;
  }

  exportJSON(): SerializedJourneyNode {
    return createSerializedJourney(this.__journeyId, this.__path);
  }

  createDOM(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'journal-journey';
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <JourneyNodeView path={this.__path} />;
  }
}
