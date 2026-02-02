import fetch from "node-fetch";
import { Client, Databases, Query } from "node-appwrite";

export default async ({ req, res }) => {
  try {
    const enquiry = JSON.parse(req.body);

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    const shopkeepers = await databases.listDocuments(
      process.env.DB_ID,
      process.env.USER_COLLECTION_ID,
      [Query.equal("role", "shopkeeper")]
    );

    for (const shop of shopkeepers.documents) {
      if (!shop.pushToken) continue;

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: shop.pushToken,
          title: "New Customer Request 📦",
          body: enquiry.queryText || "Customer is searching for a product",
          data: {
            enquiryId: enquiry.$id,
          },
        }),
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, error: err.message });
  }
};
