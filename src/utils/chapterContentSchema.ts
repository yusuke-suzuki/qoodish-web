import type { SerializedEditorState } from 'lexical';
import { IMAGE_NODE_TYPE } from './chapterContent.ts';

// The shape a chapter body may take: only the node types the editor
// registers, only the fields each of those carries, and only link and image
// URLs on protocols a browser will not run as script. Anything else is
// refused whole, on the way in and on the way out.

const MAX_NODES = 5000;
const MAX_DEPTH = 32;

const ELEMENT_FORMATS = new Set([
  '',
  'left',
  'start',
  'center',
  'right',
  'end',
  'justify'
]);
const DIRECTIONS = new Set(['ltr', 'rtl', null]);
const TEXT_MODES = new Set(['normal', 'token', 'segmented']);
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const LIST_TYPES = new Set(['number', 'bullet', 'check']);
const LIST_TAGS = new Set(['ul', 'ol']);
const LINK_TARGETS = new Set(['_blank', '_self', '_parent', '_top', null]);

const LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const IMAGE_PROTOCOLS = new Set(['https:']);

export class ChapterContentError extends Error {
  constructor(path: string, reason: string) {
    super(`${path}: ${reason}`);
    this.name = 'ChapterContentError';
  }
}

type Node = Record<string, unknown>;

function isRecord(value: unknown): value is Node {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function urlHasProtocol(url: string, protocols: Set<string>): boolean {
  try {
    return protocols.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

class Validator {
  private count = 0;

  private fail(path: string, reason: string): never {
    throw new ChapterContentError(path, reason);
  }

  private string(node: Node, key: string, path: string): string {
    const value = node[key];

    if (typeof value !== 'string') {
      this.fail(`${path}.${key}`, 'must be a string');
    }

    return value;
  }

  private nullableString(node: Node, key: string, path: string): void {
    const value = node[key];

    if (value !== undefined && value !== null && typeof value !== 'string') {
      this.fail(`${path}.${key}`, 'must be a string or null');
    }
  }

  private integer(node: Node, key: string, path: string): number {
    const value = node[key];

    if (!Number.isInteger(value)) {
      this.fail(`${path}.${key}`, 'must be an integer');
    }

    return value as number;
  }

  private optionalInteger(node: Node, key: string, path: string): void {
    if (node[key] !== undefined) {
      this.integer(node, key, path);
    }
  }

  private oneOf(node: Node, key: string, allowed: Set<unknown>, path: string) {
    if (!allowed.has(node[key])) {
      this.fail(
        `${path}.${key}`,
        `must be one of ${Array.from(allowed).join(', ')}`
      );
    }
  }

  private element(node: Node, path: string, depth: number): void {
    this.oneOf(node, 'direction', DIRECTIONS, path);
    this.oneOf(node, 'format', ELEMENT_FORMATS, path);
    this.integer(node, 'indent', path);
    this.optionalInteger(node, 'textFormat', path);

    if (node.textStyle !== undefined) {
      this.string(node, 'textStyle', path);
    }

    const { children } = node;

    if (!Array.isArray(children)) {
      this.fail(`${path}.children`, 'must be an array');
    }

    children.forEach((child, index) => {
      this.node(child, `${path}.children[${index}]`, depth + 1);
    });
  }

  private text(node: Node, path: string): void {
    this.string(node, 'text', path);
    this.integer(node, 'format', path);
    this.integer(node, 'detail', path);
    this.string(node, 'style', path);
    this.oneOf(node, 'mode', TEXT_MODES, path);
  }

  private link(node: Node, path: string, depth: number): void {
    const url = this.string(node, 'url', path);

    if (!urlHasProtocol(url, LINK_PROTOCOLS)) {
      this.fail(`${path}.url`, 'must be an http, https or mailto URL');
    }

    this.nullableString(node, 'rel', path);
    this.nullableString(node, 'title', path);

    if (node.target !== undefined) {
      this.oneOf(node, 'target', LINK_TARGETS, path);
    }

    this.element(node, path, depth);
  }

  private image(node: Node, path: string): void {
    this.integer(node, 'image_id', path);

    for (const key of ['url', 'hero']) {
      if (!urlHasProtocol(this.string(node, key, path), IMAGE_PROTOCOLS)) {
        this.fail(`${path}.${key}`, 'must be an https URL');
      }
    }
  }

  node(value: unknown, path: string, depth: number): void {
    if (depth > MAX_DEPTH) {
      this.fail(path, `nests deeper than ${MAX_DEPTH}`);
    }

    if (++this.count > MAX_NODES) {
      this.fail(path, `exceeds ${MAX_NODES} nodes`);
    }

    if (!isRecord(value)) {
      this.fail(path, 'must be an object');
    }

    this.integer(value, 'version', path);

    switch (value.type) {
      case 'root':
        if (depth !== 0) {
          this.fail(path, 'root may only appear at the top');
        }
        this.element(value, path, depth);
        return;
      case 'paragraph':
      case 'quote':
        this.element(value, path, depth);
        return;
      case 'heading':
        this.oneOf(value, 'tag', HEADING_TAGS, path);
        this.element(value, path, depth);
        return;
      case 'list':
        this.oneOf(value, 'listType', LIST_TYPES, path);
        this.oneOf(value, 'tag', LIST_TAGS, path);
        this.integer(value, 'start', path);
        this.element(value, path, depth);
        return;
      case 'listitem':
        this.integer(value, 'value', path);
        if (value.checked !== undefined && typeof value.checked !== 'boolean') {
          this.fail(`${path}.checked`, 'must be a boolean');
        }
        this.element(value, path, depth);
        return;
      case 'link':
        this.link(value, path, depth);
        return;
      case 'autolink':
        if (typeof value.isUnlinked !== 'boolean') {
          this.fail(`${path}.isUnlinked`, 'must be a boolean');
        }
        this.link(value, path, depth);
        return;
      case 'text':
      case 'tab':
        this.text(value, path);
        return;
      case 'linebreak':
      case 'horizontalrule':
        return;
      case IMAGE_NODE_TYPE:
        this.image(value, path);
        return;
      default:
        this.fail(`${path}.type`, `unknown node type ${String(value.type)}`);
    }
  }
}

export function assertChapterContent(
  content: unknown
): asserts content is SerializedEditorState {
  if (!isRecord(content)) {
    throw new ChapterContentError('content', 'must be an object');
  }

  const validator = new Validator();
  validator.node(content.root, 'content.root', 0);

  if ((content.root as Node).type !== 'root') {
    throw new ChapterContentError('content.root', 'must be a root node');
  }
}

export function isChapterContent(
  content: unknown
): content is SerializedEditorState {
  try {
    assertChapterContent(content);
    return true;
  } catch (error) {
    if (error instanceof ChapterContentError) {
      return false;
    }

    throw error;
  }
}
