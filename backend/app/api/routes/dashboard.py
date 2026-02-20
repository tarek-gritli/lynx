from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
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
    window_days: int = Query(
        7, ge=1, le=90, description="Rolling window in days for change computation"
    ),
):
    """Get usage statistics for the current user.

    Returns all-time totals plus period-over-period change computed for the last
    ``window_days`` compared to the preceding window of the same length.
    """
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
    total_tokens = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .with_entities(func.sum(Review.total_tokens))
        .scalar()
        or 0
    )
    
    now = datetime.now(timezone.utc)
    start_current = now - timedelta(days=window_days)
    end_current = now
    start_prev = start_current - timedelta(days=window_days)
    end_prev = start_current

    base = db.query(Review).filter(Review.user_id == current_user.id)

    def count_in_range(q, start, end):
        return q.filter(Review.created_at >= start, Review.created_at < end).count()

    def sum_tokens_in_range(start, end):
        return (
            db.query(func.sum(Review.total_tokens))
            .filter(
                Review.user_id == current_user.id,
                Review.created_at >= start,
                Review.created_at < end,
            )
            .scalar()
            or 0
        )

    curr_total_reviews = count_in_range(base, start_current, end_current)
    curr_successful_reviews = count_in_range(
        base.filter(Review.status == "success"), start_current, end_current
    )
    curr_failed_reviews = count_in_range(
        base.filter(Review.status == "failed"), start_current, end_current
    )
    curr_total_tokens = sum_tokens_in_range(start_current, end_current)

    prev_total_reviews = count_in_range(base, start_prev, end_prev)
    prev_successful_reviews = count_in_range(
        base.filter(Review.status == "success"), start_prev, end_prev
    )
    prev_failed_reviews = count_in_range(
        base.filter(Review.status == "failed"), start_prev, end_prev
    )
    prev_total_tokens = sum_tokens_in_range(start_prev, end_prev)

    def compute_change(curr: int, prev: int):
        if prev <= 0 and curr <= 0:
            return {"percent": 0, "direction": "up"}
        if prev <= 0 and curr > 0:
            return {"percent": 100, "direction": "up"}
        delta = curr - prev
        direction = "up" if delta >= 0 else "down"
        pct = round(abs(delta) / prev * 100)
        return {"percent": pct, "direction": direction}

    changes = {
        "total_reviews": compute_change(curr_total_reviews, prev_total_reviews),
        "successful_reviews": compute_change(
            curr_successful_reviews, prev_successful_reviews
        ),
        "failed_reviews": compute_change(curr_failed_reviews, prev_failed_reviews),
        "total_tokens": compute_change(curr_total_tokens, prev_total_tokens),
    }

    return {
        "total_reviews": total_reviews,
        "total_tokens": total_tokens,
        "successful_reviews": successful_reviews,
        "failed_reviews": failed_reviews,
        "period": {
            "window_days": window_days,
            "current": {
                "start": start_current.isoformat(),
                "end": end_current.isoformat(),
            },
            "previous": {"start": start_prev.isoformat(), "end": end_prev.isoformat()},
        },
        "period_counts": {
            "current": {
                "total_reviews": curr_total_reviews,
                "successful_reviews": curr_successful_reviews,
                "failed_reviews": curr_failed_reviews,
                "total_tokens": curr_total_tokens,
            },
            "previous": {
                "total_reviews": prev_total_reviews,
                "successful_reviews": prev_successful_reviews,
                "failed_reviews": prev_failed_reviews,
                "total_tokens": prev_total_tokens,
            },
        },
        "changes": changes,
    }
