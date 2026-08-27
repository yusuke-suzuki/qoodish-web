import { $createHeadingNode } from '@lexical/rich-text';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import type { Journey } from '../../../types/index.ts';
import { chapterSections } from '../../utils/chapterContent.ts';
import { $createImageNode } from './ImageNode.tsx';

// Rebuilds the document from the journey in place. Running inside editor.update
// (rather than remounting the editor) keeps the change on the history stack, so
// a regenerate can be undone.
export function $replaceChapterContent(journey: Journey): void {
  const root = $getRoot();
  root.clear();

  const sections = chapterSections(journey);

  if (sections.length === 0) {
    root.append($createParagraphNode());
    root.selectStart();
    return;
  }

  for (const { name, images, note } of sections) {
    const heading = $createHeadingNode('h2');
    heading.append($createTextNode(name));
    root.append(heading);

    for (const image of images) {
      root.append(
        $createImageNode({
          image_id: image.id,
          url: image.url,
          hero: image.hero
        })
      );
    }

    if (note) {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(note));
      root.append(paragraph);
    }
  }

  root.selectStart();
}
