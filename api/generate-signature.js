const { ethers } = require("ethers");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://3nigmatic.xyz");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { wallet } = req.body;

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({ error: "Invalid wallet" });
    }

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY);

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "string"],
      [
        wallet,
        process.env.CONTRACT_ADDRESS,
        1,
        "ENIGMATIC_PUBLIC_MINT"
      ]
    );

    const signature = await signer.signMessage(ethers.getBytes(messageHash));

    return res.status(200).json({ signature });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
