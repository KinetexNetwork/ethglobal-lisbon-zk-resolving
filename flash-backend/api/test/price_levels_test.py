from unittest import TestCase
from app.maker import mm0
from app.maker.maker import PriceLevelsCacheInfo, pair_to_str, PriceLevels
from app.model.pair import TokenPair, Token
from app.model.maker import TokenPair as MMTOkenPair, Token as MMToken, PriceLevel
from decimal import Decimal


pair = TokenPair(
    from_token=Token(address='0xusdt', chain_id='1'),
    to_token=Token(address='0xusdc', chain_id='100')
)

mm_pair = MMTOkenPair(
    from_token=MMToken(
        address='0xusdt', chain_id='1', decimals=6,
    ),
    to_token=MMToken(
        address='0xusdc', chain_id='100', decimals=6,
    )
)

class PriceLevelsTest(TestCase):
    def test_two_level(self) -> None:
        levels = PriceLevels(
            pair = mm_pair,
            levels = [
                PriceLevel(level=Decimal(100), price=Decimal(0.99)),
                PriceLevel(level=Decimal(1_000), price=Decimal(0.99)),
                ]
        )
        info = PriceLevelsCacheInfo.construct(
            levels={
                pair_to_str(pair): levels
            }
        )
        quote = mm0.quote_from_levels(
            levels_info=info,
            pair=pair,
            amount=200*10**6
        )
        assert quote==197999999
    
    def test_two_level_limit(self) -> None:
        levels = PriceLevels(
            pair = mm_pair,
            levels = [
                PriceLevel(level=Decimal(100), price=Decimal(0.99)),
                PriceLevel(level=Decimal(1_000), price=Decimal(0.99)),
                ]
        )
        info = PriceLevelsCacheInfo.construct(
            levels={
                pair_to_str(pair): levels
            }
        )
        quote = mm0.quote_from_levels(
            levels_info=info,
            pair=pair,
            amount=50*10**6
        )
        assert quote==0

    def test_three_level(self) -> None:
        levels = PriceLevels(
            pair = mm_pair,
            levels = [
                PriceLevel(level=Decimal(100), price=Decimal(0.99)),
                PriceLevel(level=Decimal(500), price=Decimal(0.98)),
                PriceLevel(level=Decimal(1_000), price=Decimal(0.98)),
                ]
        )
        info = PriceLevelsCacheInfo.construct(
            levels={
                pair_to_str(pair): levels
            }
        )
        quote = mm0.quote_from_levels(
            levels_info=info,
            pair=pair,
            amount=200*10**6
        )
        assert quote==195999999