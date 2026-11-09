"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import type { RichTextDocument } from "@/content/documents";
import type { MediaAsset } from "@/content/types";
import { isSafeLink } from "@/lib/rich-text";
import { ParishImage, Gallery } from "./visual-editor-extensions";
import { MediaPicker } from "./MediaPicker";
import styles from "./Admin.module.css";

export default function VisualEditor({
  value,
  onChange,
  imageTitle,
  disabled = false,
  label = "Obsah článku"
}: {
  value: RichTextDocument;
  onChange: (value: RichTextDocument) => void;
  imageTitle: string;
  disabled?: boolean;
  label?: string;
}) {
  // The editor instance stays stable while receiving the latest controlled callback.
  const changeRef = useRef(onChange);
  changeRef.current = onChange;

  const [imageOpen, setImageOpen] = useState(false);
  const [imageValue, setImageValue] = useState<MediaAsset | undefined>();
  const [editingImage, setEditingImage] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4, 5, 6] },
        link: false,
        underline: false
      }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: true,
        isAllowedUri: (url) => isSafeLink(url)
      }),
      Underline,
      ParishImage.configure({ allowBase64: false }),
      Gallery
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": label,
        "aria-multiline": "true"
      }
    },
    onUpdate: ({ editor: instance }) =>
      changeRef.current(instance.getJSON() as RichTextDocument)
  });

  useEffect(() => {
    editor?.setEditable(!disabled, false);
  }, [editor, disabled]);

  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(value))
      editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      image: instance?.isActive("image"),
      bold: instance?.isActive("bold"),
      italic: instance?.isActive("italic"),
      underline: instance?.isActive("underline"),
      strike: instance?.isActive("strike"),
      h2: instance?.isActive("heading", { level: 2 }),
      h3: instance?.isActive("heading", { level: 3 }),
      bullet: instance?.isActive("bulletList"),
      ordered: instance?.isActive("orderedList"),
      quote: instance?.isActive("blockquote"),
      link: instance?.isActive("link"),
      undo: instance?.can().undo(),
      redo: instance?.can().redo()
    })
  });

  function applyLink() {
    if (!editor) return;
    if (!link.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkOpen(false);
      return;
    }
    if (!isSafeLink(link.trim())) {
      setLinkError(
        "Použite bezpečný odkaz https://, http://, mailto:, tel: alebo miestnu cestu /…"
      );
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: link.trim() })
      .run();
    setLinkOpen(false);
    setLinkError("");
  }

  return (
    <div>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Formátovanie textu"
      >
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.bold}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Tučné (Ctrl+B)"
        >
          <strong>B</strong>
          <span className="srOnly"> Tučné</span>
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.italic}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Kurzíva (Ctrl+I)"
        >
          <em>I</em>
          <span className="srOnly"> Kurzíva</span>
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.underline}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          title="Podčiarknutie (Ctrl+U)"
        >
          <u>U</u>
          <span className="srOnly"> Podčiarknutie</span>
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.strike}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          title="Prečiarknuté"
        >
          <s>S</s>
          <span className="srOnly"> Prečiarknuté</span>
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.h2}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          Nadpis 2
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.h3}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          Nadpis 3
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.bullet}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • Zoznam
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.ordered}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. Zoznam
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.quote}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          „ Citát
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          aria-pressed={!!active?.link}
          onClick={() => {
            setLink(String(editor?.getAttributes("link").href ?? ""));
            setLinkOpen(!linkOpen);
            setLinkError("");
          }}
        >
          Odkaz
        </button>
        <button
          type="button"
          disabled={!editor || disabled}
          onClick={() => {
            const selected = editor?.isActive("image") ?? false;
            setEditingImage(selected);
            const attrs = editor?.getAttributes("image");
            setImageValue(
              selected && attrs
                ? {
                    src: String(attrs.src),
                    alt: String(attrs.alt ?? ""),
                    width: Number(attrs.width || 1200),
                    height: Number(attrs.height || 800),
                    caption: attrs.caption || attrs.title || undefined
                  }
                : undefined
            );
            setImageOpen(true);
          }}
        >
          {active?.image ? "Upraviť obrázok" : "+ Obrázok"}
        </button>
        <button
          type="button"
          disabled={!editor || disabled || !active?.undo}
          onClick={() => editor?.chain().focus().undo().run()}
          title="Späť"
        >
          ↶ Späť
        </button>
        <button
          type="button"
          disabled={!editor || disabled || !active?.redo}
          onClick={() => editor?.chain().focus().redo().run()}
          title="Znova"
        >
          ↷ Znova
        </button>
      </div>
      {linkOpen ? (
        <div className={styles.linkRow}>
          <input
            className={styles.compactInput}
            aria-label="Adresa odkazu"
            placeholder="https://…"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
            }}
          />
          <button
            type="button"
            className={styles.secondary}
            onClick={applyLink}
          >
            {link ? "Použiť odkaz" : "Odstrániť odkaz"}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setLinkOpen(false)}
          >
            Zrušiť
          </button>
          {linkError ? (
            <p className={styles.error} role="alert">
              {linkError}
            </p>
          ) : null}
        </div>
      ) : null}
      <EditorContent editor={editor} className={styles.editor} />
      {!editor ? (
        <p role="status" className={styles.hint}>
          Načítavam textový editor…
        </p>
      ) : null}
      <MediaPicker
        imageTitle={imageTitle}
        initialValue={imageValue}
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        onSelect={(image) => {
          const attrs = {
            src: image.src,
            alt: image.alt,
            width: image.width,
            height: image.height,
            caption: image.caption ?? null,
            title: image.caption ?? null
          };
          if (editingImage)
            editor?.chain().focus().updateAttributes("image", attrs).run();
          else
            editor
              ?.chain()
              .focus()
              .insertContent({ type: "image", attrs })
              .run();
        }}
      />
    </div>
  );
}
