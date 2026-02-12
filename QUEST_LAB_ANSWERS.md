# QUEST Lab Internship Application Answers

**3. Most Difficult Technical Problem**
The most technically demanding challenge I solved was designing a fault-tolerant inference architecture for "PhishGuard," a real-time security analyzer relying on third-party Large Language Model (LLM) APIs. The core struggle was dealing with the unpredictable availability of the underlying model (Mistral/Gemma), which frequently returned "429 Too Many Requests" errors due to global congestion, crashing the user experience. The problem was not just rate limiting, but doing so in a distributed client environment without a heavy backend state.

I overcame this by engineering a custom **server-side leaky bucket algorithm** coupled with a client-side adaptive queue. I implemented a strict sliding window limiter (tracking per-IP usage in memory) that proactively rejected excess requests before they hit the upstream provider, preventing the API key from being globally banned. I synchronized this with a frontend exponential backoff strategy (jittered) to handle retries gracefully. This "barrier" logic turned a stochastic, unreliable API service into a deterministic, robust application layer, ensuring 99.9% uptime for legitimate users even during peak API congestion. This taught me the critical importance of defensive engineering in AI application layers.
[Outcome: PhishGuard GitHub Repository](https://github.com/sahilparihar-git/PhishGuard)

**4. Second Most Difficult Technical Problem**
A significant struggle was ensuring the consistency of the AI’s classification logic when analyzing adversarial content. Phishing emails often contain text patterns designed to confuse automated systems (e.g., extensive whitespace, homoglyphs, or "ignore previous instructions" injection attacks). The LLM would occasionally "hallucinate" benign verdicts or refuse to process the content due to safety filter triggers, breaking the detection pipeline.

I overcame this by refining a **Chain-of-Thought (CoT)** prompting strategy. Instead of a zero-shot classification, I engineered a structured prompt that forced the model to first behave as a "parser"—extracting raw observables like SPF records and urgency markers—before switching roles to a "judge" for the final verdict. I enforced a strict Zod-based JSON schema validation on the output. If the model hallucinated an invalid format, the system would auto-correct by feeding the validation error back into the context for a specific retry. This "neuro-symbolic" validation loop reduced false negatives significantly and made the system robust against indirect prompt injections.

**5. Third Most Difficult Technical Problem**
The third major technical hurdle was optimizing the frontend performance of the "Cyber Terminal" component, which visualizes the AI’s scanning process in real-time. The requirement was to render a streaming log of analysis steps and network events without blocking the main thread, maintaining a "cinematic" 60 FPS experience. Standard React state updates for every character or log line caused massive layout thrashing and re-renders, making the app unusable on lower-end devices.

I solved this by decoupling the data ingestion from the rendering cycle. I utilized `useRef` to maintain a mutable circular buffer of logs and a dedicated `requestAnimationFrame` loop to batch DOM updates, effectively creating a virtualized rendering pipe. I stuck to strict GPU-accelerated CSS transforms for the background animations (Framer Motion) to prevent main-thread jank. This optimization allowed the interface to handle high-velocity data streams smoothly, proving that web-based AI tools can achieve native-app fidelity without sacrificing accessibility.

**6. Paper Review**
**Paper:** *"PINTO: Physics-informed transformer neural operator for learning generalized solutions of partial differential equations for any initial and boundary condition"* (S.K. Boya & D. Subramani, 2025)

**One thing that I liked:**
I was particularly impressed by the architectural ambition of PINTO to solve the "generalization" problem in Neural Operators. Most existing approaches (like standard FNOs) tend to overfit to the specific geometry or grid resolution they were trained on. PINTO’s use of an Encoder-Decoder Transformer to map arbitrary Initial/Boundary Conditions (IBCs) to the solution space is a conceptually elegant move towards a true "Foundation Model" for physics. It effectively treats the physical state as a sequence translation problem, which is a very powerful abstraction for multi-physics problems.

**One thing that I hated:**
I found the analysis regarding computational efficiency to be somewhat underdeveloped. While the paper demonstrates accuracy, it glosses over the significant $O(N^2)$ quadratic complexity bottleneck introduced by the standard self-attention mechanism, especially compared to the near-linear $O(N \log N)$ complexity of spectral methods like FNO. For real-world engineering simulations involving 3D turbulence (millions of mesh points), this scaling behavior is a critical flaw that wasn't critically addressed in the comparison against baseline methods.

**One thing that I would improve:**
I would improve the architecture by replacing the standard Softmax attention with a linear complexity variant, such as **Galerkin Attention** or integration with **FlashAttention-2**. Additionally, incorporating **Group Equivariant** layers (G-CNNs) into the encoder could hard-code known physical symmetries (rotational/translational invariance) directly into the network. This would likely improve the data efficiency significantly, allowing PINTO to learn from fewer simulations while maintaining physical consistency.

**7. Quantitative Metric**
`[Insert Link to Your Plot Here]`
*(Note: Use Python/Matplotlib to create a plot of your actual GPAs. To show "data presentation skills", use a dark background (`plt.style.use('dark_background')`) with neon cyan or green lines to match your project aesthetic. Ensure the Chart Title includes your College Name.)*

**8. Your most recent affiliation**
`[Insert Your College Name]`

**9. Did you learn anything useful in your college?**
Yes

**10. What is your level of proficiency with PyTorch?**
Intermediate (Completed 1 project end-to-end)

**11. If selected, can you come in person to IISc...**
Yes
