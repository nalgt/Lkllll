const { mega } = require('megajs');

exports.handler = async () => {
  try {
    const storage = await mega({
      email: "YOUR_MEGA_EMAIL",
      password: "YOUR_MEGA_PASSWORD"
    }).login();

    const now = Date.now();

    for (const file of storage.files) {
      const uploadedTime = file.timestamp;
      if (uploadedTime && (now - uploadedTime) > 24 * 60 * 60 * 1000) {
        await storage.delete(file.nodeId);
        console.log(`Obrisan fajl: ${file.name}`);
      }
    }

    return { statusCode: 200, body: "Cleanup complete" };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
