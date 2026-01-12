---
marp: true
theme: gaia
class: lead
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
style: |
  section {
    font-family: 'Inter', sans-serif;
    font-size: 26px; /* Slightly reduced for more content */
    padding: 30px;
  }
  h1 { color: #2D3E50; font-size: 1.5em; margin-bottom: 0.1em; }
  h2 { color: #E74C3C; font-size: 1.1em; margin-bottom: 0.4em; }
  strong { color: #2980B9; }
  blockquote { background: #f9f9f9; border-left: 8px solid #ccc; padding: 10px 15px; font-style: italic; font-size: 0.9em; }
  img { box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; background-color: transparent; }
  .columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; align-items: center; }
  .small-text { font-size: 0.7em; }
  .center { text-align: center; }
  .profile-box { background: #f0f4f8; padding: 15px; border-radius: 8px; font-size: 0.85em; }
---

# **SCSE** 🏦
## Stablecoin Clearing & Settlement Engine

<div class="columns">
<div>

**Sivasubramanian Ramanathan**
*Product Owner | Fintech & Innovation*
*Ex-BIS Innovation Hub Singapore*

**🌏 Seeking Opportunities in Singapore**
I am looking for roles in **Product Management, Fintech, Payments, RegTech**, and **Digital Assets**.

</div>
<div class="profile-box">

"I am not just a Product person. **I build.**"

I have worked across product delivery, user research, and cross-agency collaboration. I enjoy solving complex problems and bringing structure to early ideas.

**I care deeply about building products that create real impact.**

</div>
</div>

---

# **The Problem: Digital Money is Siloed**

In my work analyzing **Cross-Border Payments & CBDCs**, I've seen how liquidity fragmentation kills efficiency.

1.  🔴 **Trapped Liquidity**: 
    Stablecoins sit idle in different chains and wallets, requiring massive pre-funding.
2.  🔴 **Slow Finality**: 
    Traditional blockchains (15s - 10 min) are too slow for high-frequency point-of-sale payments.
3.  🔴 **High Gas Costs**: 
    Settling *every* coffee purchase on-chain is inefficient.

> **Goal**: Build a **Hybrid Infrastructure** that combines database speed with blockchain finality.

---

# **The Solution: SCSE** 🚀

A portfolio-grade financial engine that implements **Real-Time Gross Settlement (RTGS)** and **Multilateral Netting** for Stablecoins.

<div class="columns">
<div>

### **Hybrid Architecture**
*   ⚡ **Layer 1 (Off-Chain)**:
    10k+ TPS. Immediate clearing. Privacy-preserving compliance.
*   ⛓️ **Layer 2 (On-Chain)**:
    Sepolia Testnet. Cryptographic proof of settlement.

### **100% Liquidity Savings**
Algorithms identify and resolve circular debts (A->B->C->A).

</div>
<div>

![h:420](https://kroki.io/mermaid/svg/eNqFkMFqwzAMhu99Cl0GHTTEu-YQsL2xy8jK-gRKoqViqdPaSiFvPyeBDJax-CAE3y_r_xXo1pOr6Jmx8XjZQXxX9MIVX9EJaMAABt0X6BUzCzMrZhdmV6wYWUEi7Bp4cQ072k2iohOC7k4e9MFm8Oq7EOC9bLlB4c6FDHSSG1DqACbJ7dTYJNexmeanEiV5kcERhwvFZUrB_kiujrseJ242uN3gs9NZZLGt-hajaztULYWfFJ6bs0D3CaNqZFCTUCVUzyGi_dH4Xqlfv-oMTvE0cSDtg09LdmmJ4bxws8HtP_yvI39Q6FvJ4EmpB3jjW881ywAnvMfE4Rt_gZu_iZu_)

</div>
</div>

---

# **Technical Architecture** ⚙️

I built a full-stack simulation to demonstrate end-to-end payment lifecycles.

![w:900](https://kroki.io/plantuml/svg/eNplU9Fu2zAMfPdX6GlxgBXt8gVN3QRwkdZeHOx1YGzaViNLBkUDNYb9-yglWbvVTxJ1ujue6HvPQDwNJvEnbUcgGNQR6lNHbrJN5owjxQTWyxFaTlizQVXNnnFQa6p7zVjzRJgkJZJ3Np080le1eAB7UsWIBOxoIYXcatbA6NUI8yBcfrFMzkQ_H4IY0JzW3wRZZdVGlQa4dTQslupXouTLnGXQFimdtID2CDWrLUkVbRMEfoiV22ewLKCwr_QwmSgYvGjbqVyw1EKNovwvZW0QSCByLbss1cZ2F6Zy5t7Z2y14Xpd51AKjm8idV4Va3d2tVuqL8A2j0WA_Czwe0-Yo94q2vcl6KakdNh3GYErnuSOsvu-ia4krWjaBxwvrIcQvzWpn_SfjFpnPvl_Oqw-216ZzpLkfwiYDU1_ieJ4M67AkMKo4Gt3Blfz39UU2b5wi98EQjk6aUgf0LGqBa8M9Ek6Rd6utsFQibjC8qtrBLH0tk2SP5jIM8cFy-yqT4kM7batrQUSAHH0Iv5qOgxZQ-T4iAfWOiCmGSdNeYI_AcIH8DSIiZDoaYZHJCJEc3vz_qGtvwbaEzXUfmnmqipebfZkJ-l7uym_xB88ECq0=)

*   **Frontend**: React, Mantine, Zustand.
*   **Web3**: Wagmi, Viem, Solidity (Hardhat).
*   **Logic**: Python (FastAPI/SQLAlchemy) adapted to client-side logic for the demo.

---

# **Engineering Philosophy & Impact** 🌟

This project reflects my ability to bridge **Policy** and **Code**:

1.  **Compliance-First**: 
    Built with hooks for **Travel Rule (IVMS101)** compliance, ensuring regulatory readiness.
2.  **Standards-Based**: 
    Uses **ISO 20022** terminology (DebtorAgent, CreditorAgent) for interoperability.
3.  **Real-World Reliability**: 
    Implements proper **Double-Entry Accounting** logic, not just simple token transfers.

---

# **About the Builder** 👨‍💻

**Sivasubramanian Ramanathan**
*Product Owner | Fintech, RegTech & Digital Innovation*
*PMP | PSM II | PSPO II*

I specialize in taking messy, real-world complexity and structuring it into reliable products.

**Open for roles that sit between policy, technology, and stakeholder engagement.**

---

# **Lets Connect** 🤝

I am ready to bring this level of engineering rigor and product thinking to your team.

*   🌐 **Portfolio**: [sivasub.com](https://sivasub.com)
*   💼 **LinkedIn**: [linkedin.com/in/sivasub987](https://www.linkedin.com/in/sivasub987/)
*   💻 **Code**: [github.com/siva-sub/SCSE](https://github.com/siva-sub/SCSE)

<br>

**Live Demo**:
[siva-sub.github.io/Stablecoin-Clearing-and-Settlement-Engine](https://siva-sub.github.io/Stablecoin-Clearing-and-Settlement-Engine/)
