from fastapi import APIRouter

from app.model.outs import HealthStatus


router = APIRouter()


@router.get(
    '/api/v0/health',
    tags=['Health'],
    summary='Get service health status',
    description='Returns service health status',
    operation_id='get_health',
    response_model=HealthStatus,
    include_in_schema=False,
)
async def get_health() -> HealthStatus:
    status = HealthStatus.construct(healthy=True)
    return status
