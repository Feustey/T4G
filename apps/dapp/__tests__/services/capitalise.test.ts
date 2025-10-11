import { capitalise } from '../../services/capitalise'

describe('capitalise', () => {
  it('should capitalise the first letter of a word', () => {
    expect(capitalise('hello')).toBe('Hello')
  })

  it('should handle empty strings', () => {
    expect(capitalise('')).toBe('')
  })

  it('should handle single character strings', () => {
    expect(capitalise('a')).toBe('A')
  })

  it('should not change already capitalised strings', () => {
    expect(capitalise('World')).toBe('World')
  })

  it('should handle strings with multiple words', () => {
    expect(capitalise('hello world')).toBe('Hello world')
  })

  it('should handle strings with special characters', () => {
    expect(capitalise('élève')).toBe('Élève')
  })
})
