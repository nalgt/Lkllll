const { mega } = require('megajs');

exports.handler = async (event) => {
  try {
    const storage = await mega({
      email: "YOUR_MEGA_EMAIL",
      password: "YOUR_MEGA_PASSWORD"
    }).login();

    const body = JSON.parse(event.body);
    const { name, data } = body;

    const buffer = Buffer.from(data, 'base64');
    const uploaded = await storage.upload(name, buffer).complete;
    const link = await uploaded.link();

    const expireTime = Date.now() + 24 * 60 * 60 * 1000;

    return {
      statusCode: 200,
      body: JSON.stringify({ link, expire: expireTime })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
