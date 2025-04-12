import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import os
import gc
import sys

# Create models directory if it doesn't exist
os.makedirs("./models", exist_ok=True)

# Set timeout
os.environ["HUGGINGFACE_HUB_DOWNLOAD_TIMEOUT"] = "1800"

model_name = "deepseek-ai/deepseek-coder-1.3b-instruct"
output_dir = "./models/deepseek-1.3b"

print(f"Downloading {model_name} to {output_dir}...")

try:
    print("Downloading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.save_pretrained(output_dir)
    print("Tokenizer saved.")

    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    print("Downloading model...")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto" if torch.cuda.is_available() else "cpu",
        low_cpu_mem_usage=True
    )
    print("Saving model...")
    model.save_pretrained(output_dir)

    print("✅ Model downloaded and saved successfully!")

except Exception as e:
    print(f"❌ Error: {str(e)}")
    sys.exit(1)