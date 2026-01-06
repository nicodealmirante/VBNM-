import express from "express";
import { ethers } from "ethers";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ===== CONFIG ===== */
const RPC = process.env.RPC_URL; // Infura/Alchemy
const provider = new ethers.JsonRpcProvider(RPC);

const WLD_CONTRACT = "0x163f8c2467924be0ae7b5347228cabf260318753"; // WLD ERC20
const TARGET_WALLET = "0xf8af1505beb8a37207eb1f019ded31dd08fc571c";
const abi = ["event Transfer(address indexed from,address indexed to,uint256 value)"];

let deposited = false;

const contract = new ethers.Contract(WLD_CONTRACT, abi, provider);

/* ===== LISTEN TRANSFERS ===== */
contract.on("Transfer", (from, to, value) => {
  if (to.toLowerCase() === TARGET_WALLET.toLowerCase()) {
    const amount = Number(ethers.formatUnits(value, 18));
    if (amount > 0 && amount <= 20) {
      deposited = true;
      console.log("✅ DEPOSIT DETECTED:", amount);
    }
  }
});

/* ===== API ===== */
app.get("/deposit-status", (req, res) => {
  res.json({ deposited });
});

/* ===== START ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Running on", PORT));
