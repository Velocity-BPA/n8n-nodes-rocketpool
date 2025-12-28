/**
 * Unit Tests for Rocket Pool Utilities
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import {
	ethToReth,
	rethToEth,
	calculateRethApr,
	aprToApy,
	formatRethBalance,
	parseRethAmount,
} from '../../nodes/RocketPool/utils/rethUtils';

import {
	hashLeaf,
	verifyProof,
	calculateTreeDepth,
} from '../../nodes/RocketPool/utils/merkleUtils';

import {
	isValidPubkey,
	isValidWithdrawalCredentials,
	gweiToEth,
	ethToGwei,
	slotToEpoch,
	epochToSlot,
	calculateEffectiveBalance,
} from '../../nodes/RocketPool/utils/validatorUtils';

describe('rETH Utilities', () => {
	describe('ethToReth', () => {
		it('should convert ETH to rETH with exchange rate', () => {
			const ethAmount = 1.0;
			const exchangeRate = 1.05;
			const result = ethToReth(ethAmount, exchangeRate);
			expect(result).toBeCloseTo(0.9524, 4);
		});

		it('should handle zero amount', () => {
			expect(ethToReth(0, 1.05)).toBe(0);
		});

		it('should handle rate of 1.0', () => {
			expect(ethToReth(10, 1.0)).toBe(10);
		});
	});

	describe('rethToEth', () => {
		it('should convert rETH to ETH with exchange rate', () => {
			const rethAmount = 1.0;
			const exchangeRate = 1.05;
			const result = rethToEth(rethAmount, exchangeRate);
			expect(result).toBe(1.05);
		});

		it('should handle zero amount', () => {
			expect(rethToEth(0, 1.05)).toBe(0);
		});
	});

	describe('calculateRethApr', () => {
		it('should calculate APR from rate change', () => {
			const startRate = 1.0;
			const endRate = 1.05;
			const days = 365;
			const apr = calculateRethApr(startRate, endRate, days);
			expect(apr).toBeCloseTo(0.05, 2);
		});

		it('should handle short periods', () => {
			const startRate = 1.0;
			const endRate = 1.001;
			const days = 7;
			const apr = calculateRethApr(startRate, endRate, days);
			expect(apr).toBeGreaterThan(0);
		});
	});

	describe('aprToApy', () => {
		it('should convert APR to APY', () => {
			const apr = 0.05;
			const apy = aprToApy(apr);
			expect(apy).toBeGreaterThan(apr);
			expect(apy).toBeCloseTo(0.0513, 3);
		});
	});

	describe('formatRethBalance', () => {
		it('should format balance with precision', () => {
			expect(formatRethBalance('1.234567890123456789')).toBe('1.234568');
		});
	});

	describe('parseRethAmount', () => {
		it('should parse string amount to number', () => {
			expect(parseRethAmount('1.5')).toBe(1.5);
		});
	});
});

describe('Merkle Utilities', () => {
	describe('hashLeaf', () => {
		it('should hash leaf data consistently', () => {
			const hash1 = hashLeaf('test data');
			const hash2 = hashLeaf('test data');
			expect(hash1).toBe(hash2);
		});

		it('should produce different hashes for different data', () => {
			const hash1 = hashLeaf('data1');
			const hash2 = hashLeaf('data2');
			expect(hash1).not.toBe(hash2);
		});
	});

	describe('calculateTreeDepth', () => {
		it('should calculate depth for various sizes', () => {
			expect(calculateTreeDepth(1)).toBe(0);
			expect(calculateTreeDepth(2)).toBe(1);
			expect(calculateTreeDepth(4)).toBe(2);
			expect(calculateTreeDepth(8)).toBe(3);
		});

		it('should handle non-power-of-2 sizes', () => {
			expect(calculateTreeDepth(3)).toBe(2);
			expect(calculateTreeDepth(5)).toBe(3);
		});
	});
});

describe('Validator Utilities', () => {
	describe('isValidPubkey', () => {
		it('should validate correct pubkey format', () => {
			const validPubkey = '0x' + 'a'.repeat(96);
			expect(isValidPubkey(validPubkey)).toBe(true);
		});

		it('should reject invalid pubkey', () => {
			expect(isValidPubkey('0x123')).toBe(false);
			expect(isValidPubkey('')).toBe(false);
		});
	});

	describe('isValidWithdrawalCredentials', () => {
		it('should validate correct withdrawal credentials', () => {
			const validCreds = '0x' + '0'.repeat(64);
			expect(isValidWithdrawalCredentials(validCreds)).toBe(true);
		});

		it('should reject invalid credentials', () => {
			expect(isValidWithdrawalCredentials('0x123')).toBe(false);
		});
	});

	describe('gweiToEth', () => {
		it('should convert gwei to ETH', () => {
			expect(gweiToEth(1000000000)).toBe(1);
			expect(gweiToEth(32000000000)).toBe(32);
		});
	});

	describe('ethToGwei', () => {
		it('should convert ETH to gwei', () => {
			expect(ethToGwei(1)).toBe(1000000000);
			expect(ethToGwei(32)).toBe(32000000000);
		});
	});

	describe('slotToEpoch', () => {
		it('should convert slot to epoch', () => {
			expect(slotToEpoch(0)).toBe(0);
			expect(slotToEpoch(32)).toBe(1);
			expect(slotToEpoch(64)).toBe(2);
		});
	});

	describe('epochToSlot', () => {
		it('should convert epoch to first slot', () => {
			expect(epochToSlot(0)).toBe(0);
			expect(epochToSlot(1)).toBe(32);
			expect(epochToSlot(2)).toBe(64);
		});
	});

	describe('calculateEffectiveBalance', () => {
		it('should cap at 32 ETH', () => {
			expect(calculateEffectiveBalance(35000000000)).toBe(32000000000);
		});

		it('should round down to nearest gwei', () => {
			expect(calculateEffectiveBalance(31500000000)).toBe(31000000000);
		});
	});
});
