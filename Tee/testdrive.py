import os
import gdown
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Create a directory to store the downloaded model
model_dir = os.path.expanduser("~/Downloads/gdrive_model")
os.makedirs(model_dir, exist_ok=True)

# Google Drive folder ID
folder_id = "1TRSdk2Z6UnhhDtdvhCDHuWB3RIYVtK3m"

# Download the model files
print("Downloading model files from Google Drive...")
gdown.download_folder(id=folder_id, output=model_dir, quiet=False)

# Path to the downloaded model
model_path = model_dir

# Load tokenizer and model
print("Loading tokenizer and model...")
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto" if torch.cuda.is_available() else "cpu",
)

# Example prompt
input_text = "Write a Python function that calculates the factorial of a number."

# Tokenize input
inputs = tokenizer(input_text, return_tensors="pt")

# Run generation
print("Generating response...")
output = model.generate(**inputs, max_new_tokens=100, do_sample=True, temperature=0.7)

# Decode and print output
print("\nModel output:")
print(tokenizer.decode(output[0], skip_special_tokens=True)) 