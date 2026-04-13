"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Undo, Redo, Video, Pencil, Link as LinkIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  readOnly?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/40 sticky top-0 z-10">
      <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      
      <div className="mx-1 h-4 w-[1px] bg-border" />

      <Toggle size="sm" pressed={editor.isActive("heading", { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive("heading", { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Toggle>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      <Button
        variant="ghost"
        size="sm"
        className={cn("h-8 px-2", editor.isActive("link") && "bg-accent")}
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const url = window.prompt("URL du lien :");
          if (url) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }
        }}
      >
        <LinkIcon className="h-4 w-4 mr-1" />
        <span className="text-xs">Lien</span>
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-2" 
        onClick={() => {
          const url = window.prompt("URL de la vidéo YouTube :");
          if (url) {
            editor.commands.setYoutubeVideo({
              src: url,
            });
          }
        }}
      >
        <Video className="h-4 w-4 mr-1 text-red-500" />
        <span className="text-xs">Vidéo</span>
      </Button>

      <div className="mx-1 h-4 w-[1px] bg-border" />

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function RichTextEditor({ content, onChange, placeholder = "Rédigez votre document...", autoFocus = false, className, readOnly = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: readOnly,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-primary underline underline-offset-2 hover:text-primary/80 transition-colors",
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg border",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 sm:p-6",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden bg-background h-full shadow-sm", className)}>
      {!readOnly && <MenuBar editor={editor} />}
      <div className={cn("flex-1 overflow-y-auto bg-background", readOnly ? "cursor-default" : "cursor-text")} onClick={() => !readOnly && editor?.commands.focus()}>
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}

/**
 * RichTextEditor with a read/edit toggle button.
 * Starts in read mode. A pencil button in the header switches to edit mode.
 */
export function RichTextEditorWithToggle({ 
  content, 
  onChange, 
  placeholder, 
  className 
}: { 
  content: string; 
  onChange: (html: string) => void; 
  placeholder?: string; 
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={cn("relative", className)}>
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-2 z-20 flex items-center justify-center h-7 w-7 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Modifier la description"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      {isEditing && (
        <button
          onClick={() => setIsEditing(false)}
          className="absolute top-2 right-2 z-20 flex items-center justify-center px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          title="Terminer l'édition"
        >
          Terminé
        </button>
      )}
      <RichTextEditor
        content={content}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={!isEditing}
        className="border-0 rounded-none shadow-none"
      />
    </div>
  );
}
