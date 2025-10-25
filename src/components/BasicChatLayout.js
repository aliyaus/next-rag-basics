export const ChatHeader = () => (
    <header className="sticky top-0 z-10 mb-4 flex items-center justify-between rounded-2xl border border-zinc-200/70 bg-white/70 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:border-zinc-800 dark:from-zinc-800 dark:to-zinc-900" />
            <div>
                <h1 className="text-sm font-semibold tracking-tight">Formula 1 GPT</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Simple RAG Chatbot demo</p>
            </div>
        </div>
    </header>
)

export const MessageBubble = ({ text, role }) => (
    <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${role === "assistant"
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
            : "ml-auto bg-indigo-600 text-white"
            }`}
    >
        {text}
    </div>
)

export const MessageFooterText = () => (
    <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Press <kbd className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] dark:bg-zinc-800">Enter</kbd> to send, <kbd className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] dark:bg-zinc-800">Shift</kbd>+<kbd className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] dark:bg-zinc-800">Enter</kbd> for a new line
    </p>
)
