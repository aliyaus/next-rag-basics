import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

// use following command to run: 
// npm run seed

// Used to create the similarity of 2 vectors
const SimilarityMetric = {
    DOT_PRODUCT: 'dot_product', // 50% faster than cosine. requires vectors to be normalized. 
    COSINE: 'cosine', // used to determine how similar 2 vectors are and will get the default. does not require vectors to be normalized. 
    EUCLIDIEAN: 'euclidean' // most commmonly used. is the  euclidiean distance. 
};

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.bbc.com/sport/formula1/articles/cvgwngjxe4eo',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions'
]


const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512, // Refers to the # of characters in each chunk 
    chunkOverlap: 100, // Refers to the overlapping characters between chunks. Helps to preserve cross chunk context. All this is to ensure that we don't lose key information that may get cut off because we're splitting our text or content or data up in chunks. 
})

const createCollection = async (similarityMetric = SimilarityMetric.DOT_PRODUCT,) => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536, // Got this size by checking openai docs on embeddings for the specific model (text-embedding-3-small). Also checked datastax documentation on popular embedding models for the openai model and verified the size. 
            metric: similarityMetric,
        }
    })

    console.log("create collection response: ", res)
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION);

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
            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log("Vector insertion response: ", res)

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

createCollection().then(() => loadSampleData())