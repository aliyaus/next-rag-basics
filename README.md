# Intro to RAG Frameworks

# Steps to reproduce this project
1. create app by running `npx create-next-app@latest nextjs-rag-intro-formula1`
2. Go to datastax (https://www.datastax.com) -> Try for Free -> Signup
3. Go to Create database and create the db using the following details
   1. Select Serverless (vector)
   2. database name - <db_name>
   3. Provider - AWS
   4. Region - us-east-2 
4. Create an OpenAI Account -> Create a Secret Key
5. In your project directory copy the contents of the package.json dependencies from this repo (mainly to get the same versions of dependencies) and run `npm install` 
6. Create `scripts/loadDb.js`
7. Add following seed script to package.json
```
    "seed": "node ./scripts/loadDb.js"
```
8. Create a .env file and add following info: 
```
 ASTRA_DB_NAMESPACE=<keyspace name>
 ASTRA_DB_COLLECTION="some collection name"
 ASTRA_DB_API_ENDPOINT="db api endpoint from connection details>
 ASTRA_DB_APPLICATION_TOKEN="the application token you generate from the datastax UI> 
 OPENAI_API_KEY=<OPENAI_API_KEY>
```
9. After adding the full `scripts/loadDb.js` script -> run the following command to scrape the pages, create the embeddings, and insert the vectors: `npm run seed`
10. Create `src/app/api/chat/route.js`

# Notes
- When we ask LLMs questions...they work best when we feed them "Just Enough" content for them to give an accurate answer. So it is best to split up large bodies of text in split up chunks so that it is easily saarchable. 
