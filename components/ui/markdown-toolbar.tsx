"use client"

import { Bold, List } from "lucide-react"

export function MarkdownToolbar({ elementId }: { elementId: string }) {
    const insertText = (before: string, after: string = "") => {
        const textarea = document.getElementById(elementId) as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(textarea, newText);

        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
    };

    return (
        <div className="flex gap-1 mb-1.5 p-1 bg-gray-50 border border-gray-200 rounded-md w-fit">
            <button
                type="button"
                onClick={() => insertText("**", "**")}
                className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
                title="Negrita"
            >
                <Bold size={14} />
            </button>
            <button
                type="button"
                onClick={() => insertText("- ")}
                className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
                title="Lista"
            >
                <List size={14} />
            </button>
        </div>
    );
}
