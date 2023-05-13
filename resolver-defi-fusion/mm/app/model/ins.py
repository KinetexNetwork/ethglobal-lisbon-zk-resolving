from pydantic import BaseModel


class Order(BaseModel):
    from_actor: str
    from_chain: str
    from_token: str
    from_amount: str
    to_actor: str
    to_chain: str
    to_token: str
    to_amount: str
    collateral_chain: str
    collateral_amount: str
    collateral_unlocked: str
    deadline: int
    nonce: int


class SubmitOrder(BaseModel):
    order: Order
    signature: str
    permit_transaction: str | None
