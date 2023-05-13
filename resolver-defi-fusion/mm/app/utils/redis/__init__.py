from app.config import cfg
from app.utils.redis.factory import create_redis


global_redis, redis_ctx, get_redis = create_redis(cfg.redis)
