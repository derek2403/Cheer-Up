import logging
import os
import colorlog
from trl import GRPOConfig, ModelConfig, TrlParser
import time

from hivemind_exp.chain_utils import (
    ModalSwarmCoordinator,
    WalletSwarmCoordinator,
    setup_web3,
)
from hivemind_exp.gsm8k.generate_prompts import get_stage1_samples, get_user_input_samples, get_user_input_with_supervisor_simulation
from hivemind_exp.runner.gensyn.testnet_grpo_runner import (
    TestnetGRPOArguments,
    TestnetGRPORunner,
)
from hivemind_exp.runner.grpo_runner import GRPOArguments, GRPORunner
from hivemind_exp.gsm8k.stage3_rewards import print_training_summary

# Create a custom output recorder
def record_model_output(output, file_path=None):
    """
    Record the model's output to a file.
    
    Parameters:
    - output: The output to record
    - file_path: The path to the file to record to (defaults to supervisor_content.txt in root directory)
    """
    if file_path is None:
        # Get the path to the rl-swarm directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(os.path.dirname(current_dir))
        file_path = os.path.join(root_dir, "supervisor_content.txt")
    
    # Get the current response number by counting existing responses in the file
    response_num = 1
    try:
        with open(file_path, "r") as f:
            content = f.read()
            response_num = content.count("<model_response>") + 1
    except:
        # If file doesn't exist or can't be read, start with response 1
        pass
    
    with open(file_path, "a") as f:
        # Add a clear separator between entries with response number
        f.write(f"<model_response #{response_num}>\n{output}\n</model_response>\n\n")
        f.write("-" * 80 + "\n\n")  # Add a separator line for readability
    
    print(f"Model output (Response #{response_num}) recorded to {file_path}")

def main():
    # Setup logging.
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    handler = colorlog.StreamHandler()
    handler.setFormatter(
        colorlog.ColoredFormatter("%(green)s%(levelname)s:%(name)s:%(message)s")
    )
    root_logger.addHandler(handler)

    # Get path to supervisor_content.txt file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(os.path.dirname(current_dir))
    file_path = os.path.join(root_dir, "supervisor_content.txt")
    
    # Append a session marker instead of clearing the file
    with open(file_path, "a") as f:
        f.write("\n\n# New Session " + time.strftime("%Y-%m-%d %H:%M:%S") + "\n\n")
    
    print(f"Added new session marker to {file_path}")

    parser = TrlParser((ModelConfig, GRPOArguments, TestnetGRPOArguments, GRPOConfig))  # type: ignore
    model_args, grpo_args, testnet_args, training_args = parser.parse_args_and_config()

    # Run main training loop.
    if org_id := testnet_args.modal_org_id:
        runner = TestnetGRPORunner(ModalSwarmCoordinator(org_id, web3=setup_web3()))
    elif priv_key := testnet_args.wallet_private_key:
        runner = TestnetGRPORunner(WalletSwarmCoordinator(priv_key, web3=setup_web3()))
    else:
        runner = GRPORunner()

    # Run training
    trainer = runner.run(model_args, grpo_args, training_args, get_user_input_with_supervisor_simulation)
    
    # Make sure the summary is printed
    if trainer and hasattr(trainer, 'node'):
        print_training_summary(trainer.node)
        
        # Record the model's outputs to supervisor_content.txt
        if hasattr(trainer.node, 'round_cache'):
            # Add a section header for model responses
            with open(file_path, "a") as f:
                f.write("\n# Detailed Model Responses\n\n")
            
            # Record each stage's responses
            for stage in [(0, 0), (0, 1), (0, 2)]:
                if stage in trainer.node.round_cache:
                    with open(file_path, "a") as f:
                        f.write(f"\n## Stage {stage[1]} Responses\n\n")
                    
                    for q_hash, (timestamp, outputs) in trainer.node.round_cache[stage].items():
                        if 'responses' in outputs and outputs['responses']:
                            record_model_output(f"STAGE {stage[1]} RESPONSE:\n{outputs['responses'][0]}")
                        elif 'final_agent_decision' in outputs:
                            for peer_id, response in outputs['final_agent_decision'].items():
                                record_model_output(f"STAGE {stage[1]} FINAL DECISION (Peer: {peer_id}):\n{response}")
                                break


if __name__ == "__main__":
    main()
