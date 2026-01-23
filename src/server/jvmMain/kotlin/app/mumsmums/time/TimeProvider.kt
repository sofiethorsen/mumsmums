package app.mumsmums.time

/**
 * Provides the current time. Can be mocked in tests to control time.
 */
interface TimeProvider {
    fun currentTimeMillis(): Long
}

/**
 * Default implementation that uses the system clock.
 */
object SystemTimeProvider : TimeProvider {
    override fun currentTimeMillis(): Long = System.currentTimeMillis()
}
