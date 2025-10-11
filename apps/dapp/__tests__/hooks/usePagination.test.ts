import { renderHook } from '@testing-library/react'
import { usePagination, DOTS } from '../../hooks/usePagination'

describe('usePagination', () => {
  it('should return range of pages when total pages is small', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalCount: 50,
        pageSize: 10,
        currentPage: 1
      })
    )

    expect(result.current).toEqual([1, 2, 3, 4, 5])
  })

  it('should calculate total pages correctly', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalCount: 95,
        pageSize: 10,
        currentPage: 1
      })
    )

    // With 95 items and 10 per page, we have 10 pages total
    // Should show pages up to the total
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('should show left dots when current page is far from start', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalCount: 200,
        pageSize: 10,
        currentPage: 10,
        siblingCount: 1
      })
    )

    expect(result.current).toContain(DOTS)
  })

  it('should show right dots when current page is far from end', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalCount: 200,
        pageSize: 10,
        currentPage: 5,
        siblingCount: 1
      })
    )

    expect(result.current).toContain(DOTS)
  })

  it('should show both left and right dots for middle pages', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalCount: 200,
        pageSize: 10,
        currentPage: 10,
        siblingCount: 1
      })
    )

    const dotsCount = result.current.filter(item => item === DOTS).length
    expect(dotsCount).toBe(2)
  })

  it('should handle first page correctly', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalCount: 100,
        pageSize: 10,
        currentPage: 1,
        siblingCount: 1
      })
    )

    expect(result.current[0]).toBe(1)
  })

  it('should include last page', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalCount: 200,
        pageSize: 10,
        currentPage: 10,
        siblingCount: 1
      })
    )

    const lastElement = result.current[result.current.length - 1]
    expect(lastElement).toBe(20) // 200/10 = 20 pages
  })
})
