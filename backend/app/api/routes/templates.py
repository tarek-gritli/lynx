from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.deps import CurrentUser, SessionDep
from app.models import Template
from app.prompts import REVIEW_PROMPT

router = APIRouter()


class CreateTemplateRequest(BaseModel):
    name: str
    content: str


class UpdateTemplateRequest(BaseModel):
    name: str | None = None
    content: str | None = None


class SetDefaultTemplateRequest(BaseModel):
    template_id: int


@router.get("/templates")
def get_templates(
    db: SessionDep,
    current_user: CurrentUser,
):
    """Get all templates for the current user"""
    templates = (
        db.query(Template)
        .filter(Template.user_id == current_user.id)
        .order_by(Template.is_default.desc(), Template.created_at.desc())
        .all()
    )

    return [
        {
            "id": template.id,
            "name": template.name,
            "content": template.content,
            "is_default": template.is_default,
            "created_at": template.created_at.isoformat(),
            "updated_at": template.updated_at.isoformat(),
        }
        for template in templates
    ]


@router.get("/templates/default")
def get_default_template(
    db: SessionDep,
    current_user: CurrentUser,
):
    """Get the default template for the current user or system default"""
    default_template = (
        db.query(Template)
        .filter(Template.user_id == current_user.id, Template.is_default == True)
        .first()
    )

    if default_template:
        return {
            "id": default_template.id,
            "name": default_template.name,
            "content": default_template.content,
            "is_default": True,
            "created_at": default_template.created_at.isoformat(),
            "updated_at": default_template.updated_at.isoformat(),
        }

    return {
        "id": None,
        "name": "System Default",
        "content": REVIEW_PROMPT,
        "is_default": True,
        "created_at": None,
        "updated_at": None,
    }


@router.post("/templates")
def create_template(
    req: CreateTemplateRequest,
    db: SessionDep,
    current_user: CurrentUser,
):
    """Create a new template"""
    existing = (
        db.query(Template)
        .filter(Template.user_id == current_user.id, Template.name == req.name)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400, detail=f"Template with name '{req.name}' already exists"
        )

    if "{diff}" not in req.content:
        raise HTTPException(
            status_code=400,
            detail="Template content must include {diff} placeholder for the PR diff",
        )

    new_template = Template(
        user_id=current_user.id,
        name=req.name,
        content=req.content,
        is_default=False,
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)

    return {
        "id": new_template.id,
        "name": new_template.name,
        "content": new_template.content,
        "is_default": new_template.is_default,
        "created_at": new_template.created_at.isoformat(),
        "updated_at": new_template.updated_at.isoformat(),
    }


@router.patch("/templates/{template_id}")
def update_template(
    template_id: int,
    req: UpdateTemplateRequest,
    db: SessionDep,
    current_user: CurrentUser,
):
    """Update an existing template"""
    template = (
        db.query(Template)
        .filter(Template.id == template_id, Template.user_id == current_user.id)
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    if req.name is not None:
        existing = (
            db.query(Template)
            .filter(
                Template.user_id == current_user.id,
                Template.name == req.name,
                Template.id != template_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400, detail=f"Template with name '{req.name}' already exists"
            )

        template.name = req.name

    if req.content is not None:
        if "{diff}" not in req.content:
            raise HTTPException(
                status_code=400,
                detail="Template content must include {diff} placeholder for the PR diff",
            )
        template.content = req.content

    db.commit()
    db.refresh(template)

    return {
        "id": template.id,
        "name": template.name,
        "content": template.content,
        "is_default": template.is_default,
        "created_at": template.created_at.isoformat(),
        "updated_at": template.updated_at.isoformat(),
    }


@router.delete("/templates/{template_id}")
def delete_template(
    template_id: int,
    db: SessionDep,
    current_user: CurrentUser,
):
    """Delete a template"""
    template = (
        db.query(Template)
        .filter(Template.id == template_id, Template.user_id == current_user.id)
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    db.delete(template)
    db.commit()

    return {"status": "success"}


@router.post("/templates/set-default")
def set_default_template(
    req: SetDefaultTemplateRequest,
    db: SessionDep,
    current_user: CurrentUser,
):
    """Set a template as the default for the user"""
    template = (
        db.query(Template)
        .filter(Template.id == req.template_id, Template.user_id == current_user.id)
        .first()
    )

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Unset all other defaults for this user
    db.query(Template).filter(
        Template.user_id == current_user.id, Template.is_default == True
    ).update({"is_default": False})

    # Set this template as default
    template.is_default = True
    db.commit()

    return {"status": "success", "template_id": template.id}


@router.post("/templates/reset-default")
def reset_to_system_default(
    db: SessionDep,
    current_user: CurrentUser,
):
    """Reset to system default template by removing user's default"""
    db.query(Template).filter(
        Template.user_id == current_user.id, Template.is_default == True
    ).update({"is_default": False})

    db.commit()

    return {"status": "success"}
