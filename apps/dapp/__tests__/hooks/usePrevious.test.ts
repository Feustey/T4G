import { renderHook } from '@testing-library/react'
import { usePrevious } from '../../hooks/usePrevious'

describe('usePrevious', () => {
  it('should return undefined on initial render', () => {
    const { result } = renderHook(() => usePrevious('initial'))
    expect(result.current).toBeUndefined()
  })

  it('should return previous value after update', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'initial' }
    })

    expect(result.current).toBeUndefined()

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')

    rerender({ value: 'final' })
    expect(result.current).toBe('updated')
  })

  it('should work with different data types', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 }
    })

    expect(result.current).toBeUndefined()

    rerender({ value: 1 })
    expect(result.current).toBe(0)

    rerender({ value: 2 })
    expect(result.current).toBe(1)
  })

  it('should work with objects', () => {
    const obj1 = { name: 'John' }
    const obj2 = { name: 'Jane' }

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 }
    })

    expect(result.current).toBeUndefined()

    rerender({ value: obj2 })
    expect(result.current).toBe(obj1)
  })
})
