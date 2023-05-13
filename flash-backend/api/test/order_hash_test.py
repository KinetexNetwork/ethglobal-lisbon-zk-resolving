from unittest import TestCase
from app.swap.swapper import hash_from_order, Order

class HashOrderTest(TestCase):
    def test_order_hash(self) -> None:
        order = Order(
           from_actor= '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            from_chain= 31337,
            from_token= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
            from_amount= '65000000000000000000',
            to_actor= '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            to_chain= 13037,
            to_token= '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
            to_amount= '43000000000000000000',
            collateral_chain= 1337,
            collateral_amount= '21000000000000000000',
            deadline= 1683112151,
            nonce= 13377331
        )
        order_hash = hash_from_order(order)
        assert order_hash == '0xb082a3adf745cd9f2645a40eb35696937194fc83932c3dc5360de608b72d8a5a'