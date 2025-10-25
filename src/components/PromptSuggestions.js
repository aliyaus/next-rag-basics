export const PromptSuggestionRow = ({ setInput, handleSubmit }) => {
    const onPromptClick = (e, prompt) => {
        setInput(prompt);
        handleSubmit(e);
    };

    const prompts = [
        "Who is head of racing for Aston Martin's F1 Academy team?",
        "Who is the highest paid F1 driver?",
        "Who will be the newest driver for Ferrari?",
        "Who is the current Formula One World Driver's Champion?"
    ];

    return (
        <div className="flex flex-wrap justify-center gap-2 my-5">
            {prompts.map((prompt, index) => (
                <PromptSuggestionButton
                    text={prompt}
                    onClick={(e) => onPromptClick(e, prompt)}
                    key={`suggestion-${index}`}
                />
            ))}
        </div>
    );
};

export const PromptSuggestionButton = ({ onClick, text }) => {
    return (
        <button
            onClick={onClick}
            className="rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 transition hover:bg-zinc-200 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
            {text}
        </button>
    );
};
