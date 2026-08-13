export async function handler(event) {
    const { httpMethod, body, queryStringParameters } = event;

    const headers = {
        "Content-Type": "application/json",
        "api-key": process.env.MONGO_API_KEY
    };

    // ===== GET (READ) =====
    if (httpMethod === "GET") {
        const response = await fetch(
            `${process.env.MONGO_DATA_API_URL}/find`,
            {
                method: "POST",
                headers,
                body: JSON.stringify({
                    collection: process.env.MONGO_COLLECTION,
                    database: process.env.MONGO_DATABASE,
                    dataSource: process.env.MONGO_DATASOURCE,
                    filter: {}
                })
            }
        );

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data.documents)
        };
    }

    // ===== UPDATE =====
    if (httpMethod === "PUT") {
        const { id, update } = JSON.parse(body);

        const response = await fetch(
            `${process.env.MONGO_DATA_API_URL}/updateOne`,
            {
                method: "POST",
                headers,
                body: JSON.stringify({
                    collection: process.env.MONGO_COLLECTION,
                    database: process.env.MONGO_DATABASE,
                    dataSource: process.env.MONGO_DATASOURCE,
                    filter: { _id: { "$oid": id } },
                    update: { "$set": update }
                })
            }
        );

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    }

    return {
        statusCode: 405,
        body: "Method Not Allowed"
    };
}
