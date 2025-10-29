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


# Supabase Implementation 
Refer to https://www.youtube.com/watch?v=envR1c2cZ3Y 
1. Enable the vector extension in supabase by running `CREATE EXTENSION IF NOT EXISTS vector;`
2. Use the following SQL query to create a table to store the embeddings: 
```
create table documents (
  id serial primary key,
  title text not null,
  body text not null,
  embedding vector(1536) 
);
```
3. create index on embeddings table to setup the similarity metric by running the following: `CREATE INDEX ON documents USING ivfflat (embedding vector_ip_ops);` Refer to https://supabase.com/docs/guides/ai/vector-indexes for how similarity metrics work in supabase/pgvector. (Note that we are using negative inner product because we use OpenAI to generate our embeddings which automatically normalizes the vectors allowing us to use inner product for faster performance)
4. Create the following functions in postgres: 
```
-- Match documents using negative inner product (<#>)
create or replace function match_documents (
  query_embedding vector(1536), -- you may need to use extensions.vector(1536)
  match_threshold float, -- the minimum similarity between embeddings. This is a value between 1 and -1, where 1 is most similar and -1 is most dissimilar.
  match_count int -- the maximum number of results to return. Note the query may return less than this number if match_threshold resulted in a small shortlist. Limited to 200 records to avoid unintentionally overloading your database.
)
returns setof documents
language sql
as $$
  select *
  from documents
  where documents.embedding <#> query_embedding < -match_threshold
  order by documents.embedding <#> query_embedding asc
  limit least(match_count, 10); -- return ONLY 10 items from this function
$$;
```


