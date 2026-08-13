export const prerender = false; // Ensure this runs on the server (if SSR is enabled later)

const headers = {
    "Content-Type": "application/json",
    "api-key": import.meta.env.MONGO_API_KEY
};

const MONGO_URL = import.meta.env.MONGO_DATA_API_URL;
const MONGO_COLLECTION = import.meta.env.MONGO_COLLECTION;
const MONGO_DATABASE = import.meta.env.MONGO_DATABASE;
const MONGO_DATASOURCE = import.meta.env.MONGO_DATASOURCE;

export async function GET({ request }) {
    try {
        const response = await fetch(`${MONGO_URL}/find`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                collection: MONGO_COLLECTION,
                database: MONGO_DATABASE,
                dataSource: MONGO_DATASOURCE,
                filter: {}
            })
        });

        const data = await response.json();

        return new Response(JSON.stringify(data.documents), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}

export async function PUT({ request }) {
    try {
        const body = await request.json();
        const { id, update } = body;

        const response = await fetch(`${MONGO_URL}/updateOne`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                collection: MONGO_COLLECTION,
                database: MONGO_DATABASE,
                dataSource: MONGO_DATASOURCE,
                filter: { _id: { "$oid": id } },
                update: { "$set": update }
            })
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
