
# Cure Me Baby👇
**Empowering mental wellness with a gamified AI psychiatrist that delivers personalized, adaptive care and real-time progress insights in a TEE**

![Logo](https://github.com/derek2403/Cheer-Up/blob/main/public/logo.png?raw=true)

An AI-driven mental healthcare assistant securely operating within a TEE, leveraging Gensyn’s swarm and Upstage's RAG to adaptively learn about each patient and provide personalized, context-aware guidance—all accessible via NEAR subscription.

---

## Inspiration: How We Came Up with This Idea💡


---

## The Problem🚧

In many Asian societies, cultural stigmas associated with mental health often discourage individuals from seeking professional psychiatric help. The perception that visiting a psychiatrist is unusual or "weird" can lead to profound social pressure, causing people to avoid in-person consultations even when they may be struggling with mental health issues. In addition, there is a deep-seated concern about confidentiality as users fear that their private issues may not remain secure in traditional treatment settings. This combination of social stigma and privacy fears creates a significant barrier, leading to unmet mental health needs within these communities.


---

## The Solution🔑

To address this gap, we have built an AI-driven mental healthcare assistant (psychiatrist) that operates within a Trusted Execution Environment (TEE) for maximum data security. By integrating Gensyn Swarm for adaptive and continuously improving support and utilizing NEAR for a decentralized, subscription-based payment model, our solution provides:

**1. Confidentiality:** All interactions occur within a Phala-based TEE, meaning your sensitive mental health data is always protected inside a secure enclave. This advanced layer of security ensures that privacy is never an afterthought.

**2. Accessibility:** Our solution offers an anonymous, online environment where users can access mental health support without the fear of being judged. This enables a broader range of individuals to seek help without social stigma.

**3. Personalization:** At its core, our AI psychiatrist leverages a robust Large Language Model (LLM) to deliver adaptive, empathetic guidance through continuous analysis of daily or session feedback. In this solution, the Gensyn Swarm acts as a collective of multiple LLMs—essentially a dynamic network of expert agents in conversation—sharing and refining insights in real time. This collaborative, decentralized "roundtable" of models synthesizes aggregated, anonymized user data to steer each individual toward the optimal path for mental health improvement, ensuring that the support offered is as personalized as it is responsive. We also integrated a RAG (Retrieval-Augmented Generation) system to make answers even more accurate, grounded, and context-aware.

**4. Engagement:** Our platform also incorporates gamified progress tracking through daily memory snapshots—concise visual of the user’s emotional journey—that deliver clear, interactive feedback. This approach not only makes the experience engaging and relatable but also enhances self-awareness and adherence to mental health routines. Additional evidence from health tracking and visual feedback studies further underscores the efficacy of these elements in maintaining long-term engagement and promoting self-management.

---

## How Our Project Works⚙️

### 1. User Onboarding & Subscription
- **Login with NEAR Wallet:** Users start by logging in using their NEAR wallet.
- **Subscription Payment:** Upon login, users pay 1 NEAR via a smart contract that records their subscription. Renewals are as simple as making another payment, ensuring continuous access month-to-month.

### 2. Personalized Mental Health Interaction
- **AI-Powered Conversations:** Once authenticated, users interact with our AI psychiatrist—powered by a robust Large Language Model (LLM)—to discuss their challenges and receive empathetic guidance.
- **Adaptive Feedback:** The LLM tailors its responses in real time, offering therapeutic prompts and personalized advice based on individual session feedback.

### 3. Daily Progress & Visual Memory Wall
- **Daily Snapshots:** At the end of each day, the system generates a visual or narrative snapshot of the user’s emotional progress. These snapshots are stored on a memory wall, allowing users to visually track and reflect on their journey.
- **Engaging Feedback:** This gamified progress tracking approach reinforces positive changes by offering an interactive and rewarding visual timeline of personal growth.

### 4. Swarm Intelligence for Continuous Improvement
- **Integrated Swarm of LLMs:** The Gensyn Swarm functions as a dynamic network where multiple LLMs communicate and collaborate. This "swarm" analyzes the anonymized session data—comprising feedback, prompts, and daily snapshots—to extract actionable insights.
- **Refined Guidance:** The aggregated data is used to generate new, personalized strategies that are sent back to the LLM, ensuring that each session is progressively more aligned with the user's evolving needs.

### 5. Continuous Iterative Loop
- **Feedback Loop:** Each day’s interactions feed into the swarm, which continuously refines the system's understanding and improves the personalized guidance.
- **Evolving Support:** This iterative loop guarantees that the mental healthcare assistant evolves alongside the user, providing more effective and targeted support over time.

## Optional Document Upload for Enhanced Context
Users can further personalize their experience by optionally uploading personal documents—such as journal entries, therapy histories, or other contextual materials. This data is processed within a **R**etrieval **A**ugmented **G**eneration (RAG) pipeline, which allows the AI psychiatrist to reference the most relevant information during sessions. By incorporating this richer context, the system can deliver more accurate and individualized responses, while maintaining the same secure, TEE-based data protection.

### How it Works
1. **Upload Documents (Optional):** Users have the choice to upload files (PDF, JPG, PNG, TXT, DOC, DOCX) containing personal reflections, goals, or therapy history.  
2. **Secure Storage:** All uploaded data remains confidential within the Trusted Execution Environment (TEE), ensuring it is never exposed outside the secure enclave.  
3. **Contextual Retrieval:** When the user engages with the AI psychiatrist, the system quickly retrieves pertinent information from the uploaded documents to deliver more precise and empathic guidance.  
4. **Enhanced Responses:** Because the AI model now has additional context, it can address user concerns more holistically, providing tailored recommendations and follow-up prompts.

> **Note:** Document uploads are entirely optional; users can still benefit from the AI psychiatrist without sharing any personal files. However, providing extra context often results in a more informed and targeted mental health journey.

---

## System Architecture High-Level Overview🏗️

![Logo](https://github.com/derek2403/Cheer-Up/blob/main/public/Architecture.png?raw=true)

### 1. User Onboarding & Subscription

- **NEAR Wallet Login:**  
  Users log in via their NEAR wallet, which provides secure authentication and ease of access.

- **Smart Contract-Based Subscription:**  
  The subscription process is executed through a NEAR smart contract:
  - Users pay 1 NEAR to subscribe.
  - The contract records the payment and activates the subscription.
  - Monthly renewals are handled in the same way, ensuring continuous access.

---

### 2. Secure Processing within a TEE

- **Phala Network TEE:**  
  All core processing—including AI interactions, data storage, and document handling—is conducted within a Trusted Execution Environment provided by Phala Network. This ensures:
  - Maximum data security and privacy.
  - All sensitive user data remains secure and never leaves the enclave.

- **Integrated LLM:**  
  The TEE hosts a robust Large Language Model (LLM) that serves as the AI psychiatrist. Additionally, models like Red Pill (ex. Deepseek that are pre-deployed in TEEs by Phala Network) can be utilized without the need for self-hosting, enhancing the system’s capabilities.

---

## 3. Dynamic Adaptive Guidance with Swarm Intelligence

- **Gensyn Swarm as a Collective:**  
  The Gensyn Swarm represents a network of multiple LLMs collaborating in real time. It:
  - Aggregates anonymized session data and user feedback.
  - Functions as a roundtable of models, continuously refining and updating the prompt to make it better each time.

- **Continuous Refinement:**  
  Off-chain, the swarm analyzes data from daily interactions, generating new approaches and personalized prompts. These updates are fed back into the TEE, ensuring that the LLM evolves and adapts over time based on the user's condition.

---

## 4. Retrieval-Augmented Generation (RAG) for Document Integration

- **Optional Document Upload:**  
  Users can optionally upload personal documents (e.g., journals, therapy notes) to provide additional context.
  - These documents are processed via a RAG pipeline.
  - External APIs like Upstage handle document parsing and information extraction, returning relevant content to enhance the AI’s contextual understanding.

- **Enhanced Guidance:**  
  The extracted context is combined with session data within the TEE, allowing the LLM to deliver even more targeted and empathetic advice.

---

## 5. Gamified Daily Memory & Progress Tracking

- **Daily Visual Snapshots:**  
  Each day, the system automatically generates a visual or narrative snapshot of the user's emotional state and progress.
  - These snapshots are stored securely to form a “memory wall.”
  - Users can later review and reflect on their journey through these visual cues.
  - The images are also securely stored back in the data storage within the TEE.

- **Engagement & Self-Reflection:**  
  Gamified progress tracking not only increases user engagement but also encourages a continuous and reflective mental health journey. Research shows that such visual feedback improves adherence, self-awareness, and long-term outcomes.

---

## 6. Data Flow & Feedback Loop

- **Inbound Data Flow:**  
  - User interactions, session feedback, and optional document uploads are securely processed inside the TEE.
  
- **Outbound to Swarm:**  
  - Anonymized session data (including daily snapshots) is periodically transmitted off-chain to the Gensyn Swarm for reinforcement learning and model updates.
  
- **Inbound Updates:**  
  - The refined prompts, strategies, and model parameters generated by the swarm flow back into the TEE, forming a continuous loop of improvement and personalization.


---

## Tech Stack Overview🛠️
- **Next.js 15** – Front-end framework powering the user interface and seamless client-side interactions.
- **Three.js** – Library for creating immersive, interactive visual experiences.
- **Tailwind CSS** – Utility-first CSS framework for rapid and responsive UI styling.
- **Hero UI (formerly NextUI)** – Ready-made, customizable UI component library.
- **NEAR Blockchain** – Platform for smart contract subscriptions and secure wallet integration.
- **Phala Network** – TEE hosting and on-chain attestation proofs to ensure maximum data security.
- **Docker** – Containerization solution for securely hosting and deploying code within Phala TEEs.
- **Ethers.js** – JavaScript library to facilitate blockchain interactions and smart contract integration.
- **Gensyn Swarm** – Distributed reinforcement learning network where multiple LLMs collaborate to refine mental health guidance based on collective, anonymized user feedback.
- **Red Pill** – A fine-tuned Deepseek model deployed in a TEE, hosted via Phala Network.
- **Upstage API** – Retrieval-Augmented Generation (RAG) API for parsing and extracting meaningful information from user-uploaded documents.


---

## Important Code Directories 📂

Here's a quick reference to the major directories and files in this project, along with their purposes:

- **`components/`**  
  Contains reusable UI elements and other modular building blocks for the front end.

- **`hooks/`**  
  Houses various custom React Hooks, including functions that interact with the NEAR smart contracts and perform other utility tasks.

- **`nearAgent/`**  
  Contains the logic and configuration for hosting the LLM in the NEAR AI Agent Hub (non-TEE version).  
  > **Note:** To run everything inside a TEE, you’d integrate it with Phala Network’s secure enclave environment or use our platform

- **`pages/`**  
  All Next.js pages (routes) and their respective components live here, defining the user-facing interface and navigation.

- **`rl-swarm/`**  
  Holds the code for the Gensyn Swarm implementation, where reinforcement learning logic is managed and models can collaboratively refine mental health guidance.

- **`scripts/`**  
  Contains scripts for interacting with external services, including Upstage APIs for document parsing and information extraction in the RAG pipeline.

- **`smartcontract/`**  
  NEAR smart contract source code for handling subscription payments (1 NEAR/month) and other on-chain functionalities.

- **`Dockerfile` & `docker-compose.yml`**  
  Configuration for containerizing the application to run securely in a Phala TEE or other Docker-compatible environments. This ensures portability and consistency across different hosting setups.

---




## Future Implementations 🚀






---


## Team👥

- **Derek Liew Qi Jian**  
  - *Role*: Project Lead, AI & 
  - [LinkedIn](https://www.linkedin.com/in/derek2403/) | [Twitter](https://x.com/derek2403)

- **Phen Jing Yuan**  
  - *Role*: TEE & Frontend Integration  
  - [LinkedIn](https://www.linkedin.com/in/jing-yuan-phen-b42266295/) | [Twitter](https://x.com/ilovedahmo)

 - **Marcus Tan Chi Yau**  
  - *Role*: Frontend Developer & UI/UX Design  
  - [LinkedIn](https://www.linkedin.com/in/marcus-tan-8846ba271/)

- **Tan Zhi Wei**  
  - *Role*: Frontend Developer & UI/UX Design  
  - [LinkedIn](https://www.linkedin.com/in/tanzhiwei0328/)


