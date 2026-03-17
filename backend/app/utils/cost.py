from sqlalchemy.orm import Session

from app.models import LLMModel


def calculate_cost(
    model: str, prompt_tokens: int, completion_tokens: int, db: Session
) -> float:
    """Calculate the cost of a review in USD based on model pricing.

    Returns 0.0 if the model is not found in pricing data.
    """
    llm_model = db.query(LLMModel).filter(LLMModel.name == model).first()
    if not llm_model:
        return 0.0

    input_cost_per_token = llm_model.input_cost_per_million / 1_000_000
    output_cost_per_token = llm_model.output_cost_per_million / 1_000_000

    return round(
        prompt_tokens * input_cost_per_token
        + completion_tokens * output_cost_per_token,
        6,
    )
