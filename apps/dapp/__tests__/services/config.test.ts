import { API_BASE_URL, apiUrl, apiFetch } from '../../services/config'

describe('config', () => {
  describe('API_BASE_URL', () => {
    it('should be defined', () => {
      expect(API_BASE_URL).toBeDefined()
      expect(typeof API_BASE_URL).toBe('string')
    })

    it('should not end with a slash', () => {
      expect(API_BASE_URL.endsWith('/')).toBe(false)
    })
  })

  describe('apiUrl', () => {
    it('should return absolute URLs unchanged', () => {
      const absoluteUrl = 'https://example.com/api/test'
      expect(apiUrl(absoluteUrl)).toBe(absoluteUrl)
    })

    it('should return HTTP URLs unchanged', () => {
      const httpUrl = 'http://example.com/api/test'
      expect(apiUrl(httpUrl)).toBe(httpUrl)
    })

    it('should prepend API_BASE_URL to relative paths', () => {
      const result = apiUrl('/users')
      expect(result).toContain('/users')
      expect(result.startsWith('http')).toBe(true)
    })

    it('should handle paths without leading slash', () => {
      const result = apiUrl('users')
      expect(result).toContain('/users')
    })
  })

  describe('apiFetch', () => {
    it('should be a function', () => {
      expect(typeof apiFetch).toBe('function')
    })
  })
})
