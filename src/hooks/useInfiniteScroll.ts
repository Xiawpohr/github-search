import React, { useLayoutEffect } from 'react'
import { CallbackFunction } from '../utils/types'

export default function useInfiniteScroll(
  cb: CallbackFunction,
  targetRef: React.RefObject<HTMLDivElement>,
  rootRef: React.RefObject<HTMLDivElement>,
) {
  useLayoutEffect(() => {
    const targetNode = targetRef.current
    const rootNode = rootRef.current || null
    if (!targetNode) return

    const options = {
      root: rootNode,
      rootMargin: `0px 0px 0px 0px`,
      threshold: 0.5,
    }

    const listener = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          cb()
        }
      })
    }

    const observer = new IntersectionObserver(listener, options)
    observer.observe(targetNode)

    return () => observer.disconnect()
  }, [cb, rootRef, targetRef])
}
