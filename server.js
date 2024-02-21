import express from "express";
import { ethers } from "ethers";
import cors from "cors";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const infuraApiKey = process.env.INFURA_KEY || "";
const provider = new ethers.providers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`
);

const stakingContractAddress = process.env.CONTRACT_ADDRESS || "";
const privateKey = process.env.KEY || "";
const signer = new ethers.Wallet(privateKey, provider);

const stakingContract = new ethers.Contract(
  stakingContractAddress,
  [
    "function stake() external payable",
    "function withdraw(uint amount) external",
    "function balanceOf(address account) external view returns (uint)",
    "function totalSupply() external view returns (uint)",
    "function minStakeAmount() external view returns (uint)",
  ],
  signer
);

app.use(express.json());

app.post("/stake", async (req, res) => {
  try {
    const { amount } = req.body;
    const walletAddress = req.header("x-wallet-address");

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address not provided" });
    }

    const stakingContractWithSigner = stakingContract.connect(signer);

    const minStakeAmount = await stakingContractWithSigner.minStakeAmount();

    const min = parseFloat(ethers.utils.formatUnits(minStakeAmount));

    if (amount < min) {
      return res
        .status(400)
        .json({ error: "Amount is less than the minimum staking amount" });
    }

    const userBalance = await provider.getBalance(walletAddress);
    if (amount > userBalance) {
      return res.status(400).json({ error: "Insufficient MATIC balance" });
    }

    const transaction = await stakingContractWithSigner.stake({
      value: ethers.utils.parseUnits(amount.toString(), "ether"),
    });

    await transaction.wait();

    return res.status(200).json({ message: "Staking successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/withdraw", async (req, res) => {
  try {
    const { amount } = req.body;
    const walletAddress = req.header("x-wallet-address");

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address not provided" });
    }

    const amountWei = ethers.utils.parseUnits(amount.toString(), "ether");

    const stakingContractWithSigner = stakingContract.connect(signer);

    const userStakedBalance =
      await stakingContractWithSigner.balanceOf(walletAddress);

    if (amountWei > userStakedBalance) {
      return res
        .status(400)
        .json({ error: "Withdrawal amount exceeds staked balance" });
    }

    const transaction = await stakingContractWithSigner.withdraw(amountWei);
    await transaction.wait();

    return res.status(200).json({ message: "Withdrawal successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.use(express.static("frontend/dist"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Backend server is running on ${PORT}`);
});
