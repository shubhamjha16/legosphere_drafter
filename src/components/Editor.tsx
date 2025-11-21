import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Strikethrough,
    List, ListOrdered,
    Heading1, Heading2, Heading3,
    Quote, Undo, Redo, Eraser,
    ChevronDown, Sparkles, Save
} from 'lucide-react';

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const ToolbarButton = ({ onClick, isActive, children, title }: any) => (
        <button
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded hover:bg-gray-100 text-gray-600 ${isActive ? 'bg-gray-100 text-primary' : ''}`}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1 self-center" />;

    return (
        <div className="flex flex-col border-b border-gray-200">
            {/* Top Actions Bar */}
            <div className="flex items-center gap-3 p-2 border-b border-gray-100 bg-gray-50/50">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                    <Sparkles className="w-4 h-4" />
                    Modify Draft
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-white sticky top-0 z-10">
                {/* Font Controls (Placeholders) */}
                <div className="flex items-center gap-2 mr-2">
                    <button className="flex items-center justify-between w-32 px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50">
                        <span>Inter</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    <button className="flex items-center justify-between w-16 px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50">
                        <span>11</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                </div>

                <Divider />

                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
                    <Strikethrough className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Formatting">
                    <Eraser className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
                    <Heading1 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
                    <Heading3 className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
                    <Quote className="w-4 h-4" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <Redo className="w-4 h-4" />
                </ToolbarButton>
            </div>
        </div>
    );
};

const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start typing or ask AI to write...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8',
                style: 'font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5;',
            },
        },
    });

    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            if (editor.isEmpty) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
            <MenuBar editor={editor} />
            <div className="flex-1 overflow-y-auto bg-white">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default Editor;
