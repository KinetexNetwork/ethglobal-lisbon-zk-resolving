import { expect } from 'chai';
import { decimalInt } from './decimal';

describe('DecimalTest', function () {
  it('Should convert 12 num at x6 to 12000000', function() {
    const decimalized = decimalInt(12, 6);
    expect(decimalized).to.be.equal('12000000');
  });

  it('Should convert 12 str at x6 to 12000000', function() {
    const decimalized = decimalInt('12', 6);
    expect(decimalized).to.be.equal('12000000');
  });

  it('Should convert 32.5 num at x8 to 3250000000', function() {
    const decimalized = decimalInt(32.5, 8);
    expect(decimalized).to.be.equal('3250000000');
  });

  it('Should convert 32.5 str at x8 to 3250000000', function() {
    const decimalized = decimalInt('32.5', 8);
    expect(decimalized).to.be.equal('3250000000');
  });

  it('Should convert 0.095 num at x4 to 950', function() {
    const decimalized = decimalInt(0.095, 4);
    expect(decimalized).to.be.equal('950');
  });

  it('Should convert 0.095 str at x4 to 950', function() {
    const decimalized = decimalInt('0.095', 4);
    expect(decimalized).to.be.equal('950');
  });

  it('Should convert 0.095362987 num at x6 to 95362', function() {
    const decimalized = decimalInt(0.095362987, 6);
    expect(decimalized).to.be.equal('95362');
  });

  it('Should convert 0.095362987 str at x6 to 95362', function() {
    const decimalized = decimalInt('0.095362987', 6);
    expect(decimalized).to.be.equal('95362');
  });

  it('Should convert 0 num at x9 to 0', function() {
    const decimalized = decimalInt(0, 9);
    expect(decimalized).to.be.equal('0');
  });

  it('Should convert 0 str at x9 to 0', function() {
    const decimalized = decimalInt('0', 9);
    expect(decimalized).to.be.equal('0');
  });

  it('Should convert 0 num at x0 to 0', function() {
    const decimalized = decimalInt(0, 0);
    expect(decimalized).to.be.equal('0');
  });

  it('Should convert 0 str at x0 to 0', function() {
    const decimalized = decimalInt('0', 0);
    expect(decimalized).to.be.equal('0');
  });

  it('Should convert 143.574 num at x0 to 143', function() {
    const decimalized = decimalInt(143.574, 0);
    expect(decimalized).to.be.equal('143');
  });

  it('Should convert 143.574 str at x0 to 143', function() {
    const decimalized = decimalInt('143.574', 0);
    expect(decimalized).to.be.equal('143');
  });

  it('Should convert -32.5 num at x8 to -3250000000', function() {
    const decimalized = decimalInt(-32.5, 8);
    expect(decimalized).to.be.equal('-3250000000');
  });

  it('Should convert -32.5 str at x8 to -3250000000', function() {
    const decimalized = decimalInt('-32.5', 8);
    expect(decimalized).to.be.equal('-3250000000');
  });

  it('Should convert -0.095 num at x4 to -950', function() {
    const decimalized = decimalInt(-0.095, 4);
    expect(decimalized).to.be.equal('-950');
  });

  it('Should convert -0.095 str at x4 to -950', function() {
    const decimalized = decimalInt('-0.095', 4);
    expect(decimalized).to.be.equal('-950');
  });

  it('Should convert -0 num at x9 to 0', function() {
    const decimalized = decimalInt(-0, 9);
    expect(decimalized).to.be.equal('0');
  });

  it('Should convert -0 str at x9 to 0', function() {
    const decimalized = decimalInt('-0', 9);
    expect(decimalized).to.be.equal('0');
  });
});
