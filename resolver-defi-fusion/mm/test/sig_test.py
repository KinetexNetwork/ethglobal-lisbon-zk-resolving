from unittest import TestCase
from app.swap.swapper import SwapperSignature
from decimal import Decimal



class PriceLevelsTest(TestCase):
    def test_sig_v0(self) -> None:
        sig  = SwapperSignature(vrs = (
            27,
            0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90,
            0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064,
            
        ))
        assert sig.vs_bytes == bytes.fromhex('7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064')
        assert sig.r_bytes == bytes.fromhex('68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90')
    
    def test_sig_v1(self) -> None:
        sig  = SwapperSignature(vrs = (
            28,
            0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76,
            0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793,
            
        ))
        assert sig.vs_bytes == bytes.fromhex('939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793')
        assert sig.r_bytes == bytes.fromhex('9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76')
    
    def test_real_order_sig(self) -> None:
        full_sig = '0xbc8516bed96e862ca80d7b6ae66428c34fdbec97049745f4e5e5e51a0bcc54247a240476e1f08b7bd7b6786dd9366add8c91197e04044cf0a80c5c94216429891c'
        r = '0xbc8516bed96e862ca80d7b6ae66428c34fdbec97049745f4e5e5e51a0bcc5424'
        vs = '0xfa240476e1f08b7bd7b6786dd9366add8c91197e04044cf0a80c5c9421642989'
        sig  = SwapperSignature(signature_bytes=bytes.fromhex(full_sig[2:]))
        assert sig.vs_bytes == bytes.fromhex(vs[2:])
        assert sig.r_bytes == bytes.fromhex(r[2:])
    
        