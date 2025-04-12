from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_path = "/Users/derekliew/Desktop/models/deepseek-1.3b"

# Load tokenizer and model
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
output = model.generate(**inputs, max_new_tokens=100, do_sample=True, temperature=0.7)

# Decode and print output
print(tokenizer.decode(output[0], skip_special_tokens=True))