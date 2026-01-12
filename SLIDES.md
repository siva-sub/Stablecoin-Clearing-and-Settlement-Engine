---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #ffffff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
---

# **SCSE**
## Stablecoin Clearing & Settlement Engine

### A Hybrid Financial Infrastructure
**Siva Sub**

![bg right:40% 80%](https://raw.githubusercontent.com/siva-sub/Stablecoin-Clearing-and-Settlement-Engine/main/demo-app/public/vite.svg)

---

# **The Challenge**

### 1. **Liquidity Fragmentation**
Stablecoins are trapped in silos (different chains, different wallets), requiring massive capital buffers.

### 2. **Slow Settlement**
Traditional Blockchains (15s - 10 min) are too slow for high-frequency trading or point-of-sale payments.

### 3. **High Costs**
Running *every* transaction on-chain (Gas Fees) is distinctive for micro-payments.

---

# **The Solution: Hybrid Architecture**

Combine the **speed** of a private database with the **trust** of a public blockchain.

*   **Layer 1 (Off-Chain)**: 10,000+ TPS, Instant Finality, Privacy.
*   **Layer 2 (On-Chain)**: Net Settlement, Transparency, Trustlessness.

---

# **Architecture Overview**

![w:900 h:500](https://kroki.io/plantuml/svg/eNplU9Fu2zAMfPdX6GlxgBXt8gVN3QRwkdZeHOx1YGzaViNLBkUDNYb9-yglWbvVTxJ1ujue6HvPQDwNJvEnbUcgGNQR6lNHbrJN5owjxQTWyxFaTlizQVXNnnFQa6p7zVjzRJgkJZJ3Np080le1eAB7UsWIBOxoIYXcatbA6NUI8yBcfrFMzkQ_H4IY0JzW3wRZZdVGlQa4dTQslupXouTLnGXQFimdtID2CDWrLUkVbRMEfoiV22ewLKCwr_QwmSgYvGjbqVyw1EKNovwvZW0QSCByLbss1cZ2F6Zy5t7Z2y14Xpd51AKjm8idV4Va3d2tVuqL8A2j0WA_Czwe0-Yo94q2vcl6KakdNh3GYErnuSOsvu-ia4krWjaBxwvrIcQvzWpn_SfjFpnPvl_Oqw-216ZzpLkfwiYDU1_ieJ4M67AkMKo4Gt3Blfz39UU2b5wi98EQjk6aUgf0LGqBa8M9Ek6Rd6utsFQibjC8qtrBLH0tk2SP5jIM8cFy-yqT4kM7batrQUSAHH0Iv5qOgxZQ-T4iAfWOiCmGSdNeYI_AcIH8DSIiZDoaYZHJCJEc3vz_qGtvwbaEzXUfmnmqipebfZkJ-l7uym_xB88ECq0=)

---

# **Key Feature: Multilateral Netting**
### How we save 100% Liquidity

Example: A owes B, B owes C, C owes A. (Zero Net Obligation).

![w:800](https://kroki.io/mermaid/svg/eNqFkMFqwzAMhu99Cl0GHTTEu-YQsL2xy8jK-gRKoqViqdPaSiFvPyeBDJax-CAE3y_r_xXo1pOr6Jmx8XjZQXxX9MIVX9EJaMAABt0X6BUzCzMrZhdmV6wYWUEi7Bp4cQ072k2iohOC7k4e9MFm8Oq7EOC9bLlB4c6FDHSSG1DqACbJ7dTYJNexmeanEiV5kcERhwvFZUrB_kiujrseJ242uN3gs9NZZLGt-hajaztULYWfFJ6bs0D3CaNqZFCTUCVUzyGi_dH4Xqlfv-oMTvE0cSDtg09LdmmJ4bxws8HtP_yvI39Q6FvJ4EmpB3jjW881ywAnvMfE4Rt_gZu_iZu_)

---

# **Tech Stack**

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">

<div>

### **Frontend**
*   **React** (Vite)
*   **Mantine UI** (Components)
*   **Zustand** (State Management)
*   **Kroki** (Diagrams)

</div>

<div>

### **Web3**
*   **Wagmi** + **Viem** (Hooks)
*   **Solidity** (Smart Contracts)
*   **Sepolia Testnet** (Deployment)
*   **MetaMask SDK**

</div>

</div>

---

# **Live Demo & Verification**

The engine is **LIVE** and verifiable.

1.  **Frontend**: [Launch Demo App](https://siva-sub.github.io/Stablecoin-Clearing-and-Settlement-Engine/)
2.  **Smart Contract**: [Verified on Etherscan](https://sepolia.etherscan.io/address/0x27BeFc27e515DA31378e1DA20343134c1939f55a#code)
3.  **Token**: [Mock USDC](https://sepolia.etherscan.io/address/0x4D2C70FF3f02D91afB1872FE2595e609965D775a)

> *Try the "Inject Circle Scenario" in the Admin Panel to see the efficiency algorithm in action.*

---

# **Thank You**

**Repository**: `github.com/siva-sub/SCSE`

<br/>

> **"Bridging the gap between traditional finance speed and blockchain trust."**
