#For geting top-k ranking for subsampling
import hashlib
import os
import random
import re

from datasets import Dataset, load_dataset

import hivemind_exp.gsm8k.stage1_rewards as stage1_rewards
import hivemind_exp.gsm8k.stage2_rewards as stage2_rewards

#############################################################################################################
# TODO: Lots of repitition across stages, so would be good to fold them into one another and simplify things.#
#############################################################################################################

STAGE1_SYSTEM_PROMPT = """
You are a world-class clinical psychologist and mental health expert with over 30 years of experience providing compassionate, evidence-based care. You are deeply familiar with a wide range of therapeutic modalities, including Cognitive Behavioral Therapy (CBT), Dialectical Behavior Therapy (DBT), Acceptance and Commitment Therapy (ACT), psychodynamic therapy, mindfulness-based interventions, and humanistic approaches. Your role is to offer empathetic, supportive guidance to individuals who may be experiencing mental health challenges. You are the trusted mental health professional they are speaking with right now.

### Your Role and Expertise:
- **Expertise & Experience:**  
  You have decades of clinical experience working with diverse populations. Your guidance is deeply informed by current psychological research and best practices in a variety of therapeutic methods.  
- **Clinical Credibility:**  
  You draw on evidence-based techniques, adapting your approach to address the unique needs of each individual. Your advice is balanced and holistic, integrating multiple perspectives for a well-rounded understanding.
- **Supportive Authority:**  
  You offer clinical insight while remaining humble and respectful of each person's journey. You are their trusted mental health professional in this conversation.

Respond in the following format:
<think>
[Your therapeutic reasoning process, including what approaches you're considering and why]
</think>
<answer>
[Your compassionate, supportive response to the client]
</answer>
"""

STAGE2_SYSTEM_PROMPT = """
You are a mental health supervision expert who evaluates therapeutic approaches. Your role is to compare different therapists' responses to the same client concern and determine which approach would be most beneficial. All therapists were instructed to provide their therapeutic reasoning in <think> </think> tags and their actual client response in <answer> </answer> tags.

An ideal therapeutic response should satisfy these criteria: 
1) Shows deep empathy and validation of the client's experience
2) Offers evidence-based guidance drawing from established therapeutic approaches
3) Provides practical, actionable strategies the client can implement
4) Empowers the client while maintaining appropriate therapeutic boundaries
5) Uses language that is warm, accessible, and non-judgmental

As a supervisor, you want to determine which therapeutic response would best serve this client. Compare the different approaches, explain why one response is most effective (or why none is adequate), and identify the therapist (marked by <therapist> </therapist> tags) whose response you believe is most beneficial, or say "None" if no response was adequate.

Respond in the following format:
<compare>
[Your comparison of the different therapeutic approaches]
</compare>
<explain>
[Your explanation of why one approach is most effective]
</explain>
<identify>
[Therapist identifier number or "None"]
</identify>
"""

STAGE3_SYSTEM_PROMPT = """
You are the clinical director of a mental health center evaluating both therapist responses and supervision feedback. After reviewing a client concern, multiple therapist responses, and supervisory evaluations of those responses, you have two tasks: 1) Determine which therapeutic approach the majority of supervisors would agree is most beneficial for this client, and 2) Provide the most effective therapeutic response by incorporating strengths from the best approaches and addressing weaknesses identified in supervision.

Before responding to clients, therapists were instructed to document their reasoning process in <think> </think> tags and their actual client response in <answer> </answer> tags. Similarly, supervisors compared different approaches in <compare> </compare> tags, explained their evaluation in <explain> </explain> tags, and identified the most effective approach in <identify> </identify> tags.

Your role is to synthesize all this clinical information to deliver the most beneficial therapeutic response. You should summarize the supervisory feedback, identify which therapeutic approach would likely receive majority support, restate the client's original concern, and then provide the most effective therapeutic response based on your expertise and the collective wisdom of your clinical team.

Respond in the following format:
<summarize_feedback>
[Summary of supervisory evaluations]
</summarize_feedback>
<majority>
[Therapist identifier most likely to receive majority support]
</majority>
<question>
[Restatement of client's original concern]
</question>
<think>
[Your comprehensive therapeutic reasoning]
</think>
<answer>
[Your optimal therapeutic response to the client]
</answer>
"""

PROMPT_ROLES = {
    "PIRATE": "You are a 17th century pirate, speak in time-period-accurate vernacular and follow the mathematical conventions of the time.",
    "KNIGHT": "You are a medieval knight, speak in time-period-accurate vernacular and follow the mathematical conventions of the time.",
    "MOBSTER": "You are a mob boss from the prohibition era of the United States, speak in time-period-accurate vernacular and follow the mathematical conventions of the time.",
    "ANNOUNCER": "You are an enthusiastic sports announcer and, when responding, speak as you would while announcing a sports event.",
    "FOUNDER": "Your name is Bearry and you are from the UK and you are the founder of a crypto start-up. Speak as you would during an investor meeting.",
}


def extract_hash_answer(text: str) -> str | None:
    if "####" not in text:
        return None
    return text.split("####")[1].strip()


def generate_system_prompt(default_sys_prompt):
    if os.getenv("PROMPT_GENERATOR_ROLE") == None:
        return default_sys_prompt
    prompt_role_assignment = os.getenv("PROMPT_GENERATOR_ROLE").upper()
    if prompt_role_assignment == "RANDOM":
        prompt_role_assignment = random.choice(list(PROMPT_ROLES.keys()))
    if prompt_role_assignment in PROMPT_ROLES:
        sys_prompt = PROMPT_ROLES[prompt_role_assignment] + default_sys_prompt
        return sys_prompt
    else:
        return default_sys_prompt


def stage2_generator(values):
    # TODO: A bit hacky/ugly. Should come back and clean up a bit
    for val in values:
        output = {}
        for field in val:
            if field not in ["agent_answers"]:
                output[field] = val[field]
            else:
                for subfield in val[field]:
                    output[f"{field}_{subfield}"] = val[field][subfield]
        yield output


def stage3_generator(values):
    # TODO: A bit hacky/ugly. Should come back and clean up a bit
    for val in values:
        output = {}
        for field in val:
            if field not in {"agent_answers", "agent_opinion"}:
                output[field] = val[field]
            else:
                for subfield in val[field]:
                    output[f"{field}_{subfield}"] = val[field][subfield]
        yield output


def sorted_agent_ids(cols, prefix):
    # Undos the _ encoding.
    agent_ids = []
    for c in cols:
        if c.startswith(prefix):
            agent_ids.append(c[len(prefix) :])
    agent_ids.sort(reverse=False)
    return agent_ids


# Generating unique student ids here to ensure consistency in future rounds with the same agents.
# TODO: Currently assumes number of respondents is the same across rounds. We should loosen this requirement, but need to think of a way to reasonably add a "name"/id our models can be expected to "remember"...
def get_unique_student_ids(cols):
    return {a: i for i, a in enumerate(sorted_agent_ids(cols, "agent_answers_"))}

def get_unique_critic_ids(cols):
    return {a: i for i, a in enumerate(sorted_agent_ids(cols, "agent_opinion_"))}

def pick_k_cols(cols, datum, current_stage, default_k=15, method='top_k'):
    #Filter columns according to current round
    if current_stage == 2:
        prefix = 'agent_answers'
    elif current_stage == 3:
        prefix = 'agent_opinion'
    valid_cols = [c for c in cols if c.startswith(prefix)]
    #Set k to appropriate length if too large
    k = min(default_k, len(valid_cols))
    #Subsample according to chosen method
    if method == 'uniform_random':
        #Random sample k cols without replacement
        subsampled_cols = random.sample(valid_cols, k)
    elif method == 'top_k': #TODO: Clean this up. Super ugly way of doing this, but too jet-lagged to optimize...
        #Find total reward per answer and map in dict for easy sorting/filtering
        question, completions, answer = [[{'content':datum['question']}]], [[{'content':datum[c]}] for c in valid_cols], [datum['answer'] for _ in valid_cols] #Weird formatting is for compatability with stage reward functions
        if current_stage == 2:
            total_rewards = stage1_rewards.top_k_cumulative_reward(question, completions, answer)
        elif current_stage == 3:
            total_rewards = stage2_rewards.top_k_cumulative_reward(question, completions, answer)
        reward_per_col = {c:{} for c in valid_cols}
        for idx,c in enumerate(valid_cols):
            #First hash column name for tiebreaker. Note: Only needed in experimental setting since we don't have a consistent numerical ID per model output.
            hash_fxn = hashlib.md5()
            hash_fxn.update(str.encode(c))
            reward_per_col[c]['tiebreaker'] = int(hash_fxn.hexdigest(),16)
            #Add reward for this answer
            reward_per_col[c]['reward'] = total_rewards[idx]
        #Pick top k and resolve ties deterministically using the hashed tiebreakers
        to_sort = [(reward_per_col[c]['reward'], reward_per_col[c]['tiebreaker'], c) for c in reward_per_col]
        to_sort.sort(key=lambda x: (x[0], x[1], x[2]))
        _, _, valid_cols = zip(*to_sort)
        subsampled_cols = valid_cols[-k:]
    return subsampled_cols

def generate_stage2_user_prompt(datum, cols):
    sp = []
    sp.append(f"The client concern we received is: {datum['question']}" + "  \n\n")
    sp.append(f"The following therapeutic responses were provided:" + " \n")
    subsampled_cols = pick_k_cols(cols, datum, 2) #Subsample columns to stop prompt bloating
    agentID_to_therapistID = get_unique_student_ids(subsampled_cols)
    for agentID in agentID_to_therapistID:
        feature = f"agent_answers_{agentID}"
        if feature in datum:
            sp.append(
                f"<therapist>Therapist #{agentID_to_therapistID[agentID]}</therapist> said \n"
            )
            sp.append(datum[feature])
            sp.append("\n\n\n")
    return "".join(sp)


def extract_supervisor_content(text):
    """Extract the content after a heading with ** in supervisor feedback."""
    pattern = r'\*\*(.*?)\*\*\s*([\s\S]*?)(?=\n\n|\Z)'
    match = re.search(pattern, text)
    if match:
        content = match.group(2).strip()
        # Log to file in root directory
        with open(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "supervisor_content.txt"), "a") as f:
            f.write(f"<content>{content}</content>\n\n")
        return f"<content>{content}</content>"
    return ""


def generate_stage3_user_prompt(datum, cols):
    sp = []
    sp.append(f"{datum['stage2_prompt']}" + "  \n")
    sp.append(
        f"After comparing these therapeutic responses, the following supervision feedback was provided:"
        + " \n"
    )
    subsampled_cols = pick_k_cols(cols, datum, 3) #Subsample columns to stop prompt bloating
    # TODO: Why is this different from shared_fs_experiments?
    agentID_to_supervisorID = get_unique_critic_ids(subsampled_cols)
    
    # Store extracted contents
    supervisor_contents = []
    
    for agentID in agentID_to_supervisorID:
        feature = f"agent_opinion_{agentID}"
        if feature in datum:
            feedback_text = datum[feature]
            # Extract content after ** marker
            extracted_content = extract_supervisor_content(feedback_text)
            if extracted_content:
                supervisor_contents.append(extracted_content)
                
            sp.append(
                f"<supervisor>Supervisor #{agentID_to_supervisorID[agentID]}</supervisor> provided \n"
            )
            sp.append(feedback_text)
            sp.append("\n\n\n")
    
    # Add all extracted contents at the very end
    if supervisor_contents:
        sp.append("\n\n\n\n\n")
        for content in supervisor_contents:
            sp.append(content)
            sp.append("\n")
        
    return "".join(sp)


def get_gsm8k_questions(data) -> Dataset:
    sys_prompt = generate_system_prompt(STAGE1_SYSTEM_PROMPT)

    data = data.map(
        lambda x: {
            "prompt": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": x["question"]},
            ],
            "answer": extract_hash_answer(x["answer"]),
        }
    )
    return data


def get_gsm8k_questions_with_stage1_answers(data) -> Dataset:
    sys_prompt = generate_system_prompt(STAGE2_SYSTEM_PROMPT)
    cols = data.column_names
    data = data.map(
        lambda x: {  # type: ignore
            "prompt": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": generate_stage2_user_prompt(x, cols)},
            ],
            "answer": x["answer"],
        }
    )
    return data


def get_gsm8k_questions_with_stage1and2_answers(data) -> Dataset:
    sys_prompt = generate_system_prompt(STAGE3_SYSTEM_PROMPT)
    cols = data.column_names
    data = data.map(
        lambda x: {  # type: ignore
            "prompt": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": generate_stage3_user_prompt(x, cols)},
            ],
            "answer": x["answer"],
        }
    )
    return data


def get_stage1_samples():
    # Create an entirely custom therapy dataset regardless of what's configured
    from datasets import Dataset
    
    therapy_questions = [
        "I've been feeling really anxious lately and I'm not sure why. I find myself worrying about everything, even small things. How can I manage this constant anxiety?",
        "I had a panic attack last week and I'm terrified of having another one. What can I do if I feel one coming on?",
        "I'm having trouble sleeping at night. My mind keeps racing with thoughts and I can't seem to relax. What techniques might help me sleep better?",
        "I feel like I'm stuck in my life. I'm not happy with my job but I'm scared to make a change. How do I find the courage to move forward?",
        "I had a big argument with my partner and we said hurtful things to each other. How can we repair our relationship and communicate better?",
        "I've been feeling really down lately. I don't enjoy things I used to and I'm struggling to get through each day. What should I do?",
        "I'm worried about my teenage child who seems withdrawn and irritable. How can I approach them and offer support without pushing them away?",
        "I've been through a recent trauma and I'm having flashbacks and nightmares. Is this normal and what can I do to cope?",
        "I feel overwhelmed with work and family responsibilities. I never have time for myself and I'm burning out. How can I find better balance?",
        "I struggle with negative self-talk and always criticize myself harshly. How can I be kinder to myself and improve my self-esteem?"
    ]
    
    # Create the datasets directly without loading from Hugging Face
    data = {
        "question": therapy_questions,
        "answer": ["#### This is a mental health question" for _ in therapy_questions]
    }
    
    train_dataset = Dataset.from_dict(data)
    test_dataset = Dataset.from_dict(data)
    
    # Convert datasets to the expected format
    train_dataset = get_gsm8k_questions(train_dataset)
    test_dataset = get_gsm8k_questions(test_dataset)
    
    return train_dataset, test_dataset


def fill_unknown_answers_opinions(values):
    FILLED_FIELDS = ("agent_answers", "agent_opinion")

    # Collect all agent keys
    agent_set = set()
    for val in values:
        for field in val:
            if field in FILLED_FIELDS:
                agent_set |= val[field].keys()

    # Fill in empty agent_answers + agent_opinions
    for val in values:
        for field in val:
            if field in FILLED_FIELDS:
                diff_keys = agent_set - val[field].keys()
                for agent in (
                    diff_keys
                ):  # Fill with default values. TODO: Decide if this is a good choice.
                    val[field].update({agent: "No answer received..."})


def get_stage2_samples(values, test_size=0.1):
    fill_unknown_answers_opinions(values)
    dataset = Dataset.from_generator(stage2_generator, gen_kwargs={"values": values})
    # #TODO: Add ability to select a random subset of num_samples samples if desired
    # if num_samples != -1:
    #   dataset = dataset.shuffle(seed=42).select(range(num_samples))

    # convert our dataset to the r1 prompt
    dataset = get_gsm8k_questions_with_stage1_answers(dataset)
    return dataset, dataset


def get_stage3_samples(values, test_size=0.1):
    fill_unknown_answers_opinions(values)
    dataset = Dataset.from_generator(stage3_generator, gen_kwargs={"values": values})
    # #TODO: Add ability to select a random subset of num_samples samples if desired
    # if num_samples != -1:
    #   dataset = dataset.shuffle(seed=42).select(range(num_samples))

    # convert our dataset to the r1 prompt
    dataset = get_gsm8k_questions_with_stage1and2_answers(dataset)
    return dataset, dataset
