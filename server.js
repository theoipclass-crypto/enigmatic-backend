require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { ethers } = require("ethers");

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5
});

app.use(limiter);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY);

app.post("/generate-signature", async (req, res) => {

  try {

    const { wallet } = req.body;

    if (!ethers.isAddress(wallet)) {
      return res.status(400).json({
        error: "Invalid wallet"
      });
    }

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "string"],
      [
        wallet,
        process.env.CONTRACT_ADDRESS,
        1,
        "ENIGMATIC_PUBLIC_MINT"
      ]
    );

    const signature = await signer.signMessage(
      ethers.getBytes(messageHash)
    );

    return res.json({
      signature
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Server error"
    });
  }

});

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("ENIGMATIC backend online");
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});