import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

const {
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    OPENAI_API_KEY
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
});

export async function POST(req) {
    try {
        const body = await req.json()
        // get latest message sent by the user
        const latestMessage = body.content;
        console.log("[Supabase-Chat] API message Received: ", body)
        let docContext = "";

        // create a text embedding for the latest message sent by the user 
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float"
        });

        // traverse db of embeddings for closest context match to the latest message embedding
        try {
            const { data: documents } = await supabase.rpc('match_documents', {
                query_embedding: embedding.data[0].embedding, // pass the query embedding
                match_threshold: 0.50, // choose an appropriate threshold for your data
                match_count: 10, // choose the number of matches
            })
            const docsMap = documents?.map(doc => doc.body);
            docContext = JSON.stringify(docsMap);
            console.log("Context retrieved from embeddings: ", docContext)

        } catch (err) {
            console.log("Error querying db...", err)
            docContext = "";
        }

        const template = {
            role: "system",
            content: `You are an AI assistant who knows everything about Formula One. Use the below context to augment what you know about Formula One racing. If the context doesn't include the information you need then answer based on your existing knowledge and don't mention the source of your information or what the context does or doesn't include. Format responses using markdown where applicable and don't return images. 
        ------
        START CONTEXT
        ${docContext}
        END CONTEXT
        ------
        QUESTION: ${latestMessage}
        ------
        `
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            // stream: true,
            stream: false,
            messages: [template]
        });

        const reply = completion.choices?.[0]?.message?.content ?? "";
        return Response.json({ reply })
    } catch (err) {
        throw err;
    }

}