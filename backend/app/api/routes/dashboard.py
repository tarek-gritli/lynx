from dataclasses import dataclass
from datetime import datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func

from app.api.deps import CurrentUser, SessionDep
from app.constants import Provider
from app.logging import get_logger
from app.models import Review

logger = get_logger(__name__)

router = APIRouter()


@dataclass
class ReviewFilters:
    """Filterable fields for reviews - add new filters here"""

    provider: str | None = None
    model: str | None = None
    repo_name: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: str | None = None

    FIELD_MAP = {
        "provider": Review.provider,
        "model": Review.model,
        "repo_name": Review.repo_name,
        "status": Review.status,
    }

    def apply(self, query):
        """Apply all non-None filters to the query"""
        for field_name, column in self.FIELD_MAP.items():
            value = getattr(self, field_name)
            if value is not None:
                query = query.filter(column == value)

        if self.start_date:
            query = query.filter(Review.created_at >= self.start_date)
        if self.end_date:
            query = query.filter(Review.created_at <= self.end_date)

        return query

    def to_dict(self) -> dict:
        """Return active filters as dict"""
        return {
            k: v for k, v in self.__dict__.items() if v is not None and k != "FIELD_MAP"
        }


def get_review_filters(
    provider: Provider | None = Query(None, description="Filter by provider"),
    model: str | None = Query(None, description="Filter by model"),
    repo_name: str | None = Query(None, description="Filter by repository name"),
    start_date: datetime | None = Query(None, description="Filter by start date"),
    end_date: datetime | None = Query(None, description="Filter by end date"),
    status: Literal["pending", "success", "failed"] | None = Query(
        None, description="Filter by review status (pending, success, or failed)"
    ),
) -> ReviewFilters:
    """Dependency to parse review filters from query params"""
    return ReviewFilters(
        provider=provider,
        model=model,
        repo_name=repo_name,
        start_date=start_date,
        end_date=end_date,
        status=status,
    )


FiltersDep = Annotated[ReviewFilters, Depends(get_review_filters)]


@router.get("/reviews")
def get_reviews(
    db: SessionDep,
    current_user: CurrentUser,
    filters: FiltersDep,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """Get paginated reviews for the current user with optional filters"""
    offset = (page - 1) * limit

    query = db.query(Review).filter(Review.user_id == current_user.id)
    query = filters.apply(query)

    total = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "reviews": reviews,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
        "filters": filters.to_dict(),
    }


@router.get("/reviews/{review_id}")
def get_review_detail(
    review_id: int,
    db: SessionDep,
    current_user: CurrentUser,
):
    """Get detailed information for a specific review"""
    review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.user_id == current_user.id)
        .first()
    )

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    return review


@router.get("/stats")
def get_stats(
    db: SessionDep,
    current_user: CurrentUser,
):
    """Get usage statistics for the current user"""
    total_reviews = db.query(Review).filter(Review.user_id == current_user.id).count()
    successful_reviews = (
        db.query(Review)
        .filter(Review.user_id == current_user.id, Review.status == "success")
        .count()
    )
    failed_reviews = (
        db.query(Review)
        .filter(Review.user_id == current_user.id, Review.status == "failed")
        .count()
    )
    pending_reviews = total_reviews - successful_reviews - failed_reviews
    total_tokens = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .with_entities(func.sum(Review.total_tokens))
        .scalar()
        or 0
    )

    return {
        "total_reviews": total_reviews,
        "total_tokens": total_tokens,
        "successful_reviews": successful_reviews,
        "failed_reviews": failed_reviews,
        "pending_reviews": pending_reviews,
    }
