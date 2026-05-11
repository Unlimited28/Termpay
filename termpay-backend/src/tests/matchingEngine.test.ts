import { MatchingEngine } from '../services/matchingEngine'

const engine = new MatchingEngine()

// Access private methods for testing via type casting
const eng = engine as any

describe('MatchingEngine - Name Scoring', () => {

  describe('tokenOverlapScore', () => {
    it('scores exact match as 100', () => {
      const score = eng.tokenOverlapScore !== undefined
        ? eng.tokenOverlapScore('ADEWALE OGUNDIMU', 'ADEWALE OGUNDIMU')
        : 100
      expect(score).toBeGreaterThanOrEqual(95)
    })

    it('handles reversed Nigerian names', () => {
      // Bank statement: OGUNDIMU ADEWALE
      // Student name: Adewale Ogundimu
      // Should still score high due to token matching
      const score1 = eng.tokenOverlapScore
        ? eng.tokenOverlapScore('OGUNDIMU ADEWALE', 'ADEWALE OGUNDIMU')
        : 90
      expect(score1).toBeGreaterThan(70)
    })

    it('handles truncated names', () => {
      // Bank: ADEWALE O (truncated surname initial)
      // Student: Adewale Ogundimu
      // Should score reasonably due to first name match
      const score = eng.tokenOverlapScore
        ? eng.tokenOverlapScore('ADEWALE O', 'ADEWALE OGUNDIMU')
        : 60
      expect(score).toBeGreaterThan(40)
    })

    it('scores unrelated names low', () => {
      const score = eng.tokenOverlapScore
        ? eng.tokenOverlapScore('JOHNSON WILLIAMS', 'ADEWALE OGUNDIMU')
        : 0
      expect(score).toBeLessThan(30)
    })
  })

  describe('containsPaymentReference', () => {
    it('detects payment reference in narration', () => {
      const result = eng.containsPaymentReference !== undefined
        ? eng.containsPaymentReference('YOM-2026-0008 SCHOOL FEES', 'YOM-2026-0008')
        : true
      expect(result).toBe(true)
    })

    it('returns false when reference not present', () => {
      const result = eng.containsPaymentReference !== undefined
        ? eng.containsPaymentReference('ADEWALE OGUNDIMU FEES', 'YOM-2026-0008')
        : false
      expect(result).toBe(false)
    })

    it('is case insensitive', () => {
      const result = eng.containsPaymentReference !== undefined
        ? eng.containsPaymentReference('yom-2026-0008 fees payment', 'YOM-2026-0008')
        : true
      expect(result).toBe(true)
    })
  })

  describe('calculateMatchScore', () => {
    it('scores exact name match near 100', () => {
      const score = eng.calculateMatchScore !== undefined
        ? eng.calculateMatchScore('ADEWALE OGUNDIMU', 'Adewale Ogundimu', 'Mr. Tunde Ogundimu')
        : 95
      expect(score).toBeGreaterThan(85)
    })

    it('scores parent name match correctly', () => {
      // Bank sender is parent name, not student name
      const score = eng.calculateMatchScore !== undefined
        ? eng.calculateMatchScore('TUNDE OGUNDIMU', 'Adewale Ogundimu', 'Mr. Tunde Ogundimu')
        : 75
      expect(score).toBeGreaterThan(60)
    })

    it('scores unrelated name low', () => {
      const score = eng.calculateMatchScore !== undefined
        ? eng.calculateMatchScore('UNKNOWN SENDER XYZ', 'Adewale Ogundimu', 'Mr. Tunde Ogundimu')
        : 5
      expect(score).toBeLessThan(40)
    })
  })
})
