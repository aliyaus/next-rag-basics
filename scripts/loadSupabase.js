import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import "dotenv/config";
import { createClient } from '@supabase/supabase-js';

const {
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    OPENAI_API_KEY
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
]

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512, // Refers to the # of characters in each chunk 
    chunkOverlap: 100, // Refers to the overlapping characters between chunks. Helps to preserve cross chunk context. All this is to ensure that we don't lose key information that may get cut off because we're splitting our text or content or data up in chunks. 
})

const loadSampleData = async () => {

    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
    });

    for await (const url of f1Data) {
        const content = await scrapePage(url);
        const chunks = await splitter.splitText(content);
        for await (const chunk of chunks) {
            // create the embedding for each chunk 
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float",
            })

            const vector = embedding.data[0].embedding

            // insert to supabase table
            const { data, error } = await supabase.from('documents').insert({
                title: '',
                body: chunk,
                embedding: vector,
            }).select('id')

            console.log("Vector insertion response: ", data)

            if (error) {
                console.error("Error inserting vector embedding into supabase: ", error)
            }
        }

    }
}

const scrapePage = async (url) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML);
            await browser.close();
            return result;
        }
    })
    return (await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}

loadSampleData()