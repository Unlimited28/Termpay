import { useState, useEffect } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  formatter?: (n: number) => string
}

const CountUp = ({ end, duration = 800, prefix = '', suffix = '', formatter }: CountUpProps) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const currentCount = Math.floor(progress * end)

      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  const displayValue = formatter ? formatter(count) : count.toLocaleString()

  return (
    <span>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

export default CountUp
