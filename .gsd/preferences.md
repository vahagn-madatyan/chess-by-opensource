---
version: 1
models:
  research:
    model: moonshotai/kimi-k2.5
    fallbacks:
      - qwen/qwen3.5-397b-a17b
  planning:
    model: deepseek/deepseek-r1-0528
    fallbacks:
      - moonshotai/kimi-k2.5
      - z-ai/glm-5
  execution:
    model: qwen/qwen3-coder
    fallbacks:
      - minimax/minimax-m2.5
      - z-ai/glm-5
  completion:
    model: qwen/qwen-plus-2025-07-28
    fallbacks:
      - minimax/minimax-m2.5
---