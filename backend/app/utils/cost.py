from app.constants import MODEL_PRICING


def calculate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    """Calculate the cost of a review in USD based on model pricing.

    Returns 0.0 if the model is not found in pricing data.
    """
    pricing = MODEL_PRICING.get(model)
    if not pricing:
        return 0.0

    input_cost_per_token = pricing[0] / 1_000_000
    output_cost_per_token = pricing[1] / 1_000_000

    return round(
        prompt_tokens * input_cost_per_token
        + completion_tokens * output_cost_per_token,
        6,
    )
