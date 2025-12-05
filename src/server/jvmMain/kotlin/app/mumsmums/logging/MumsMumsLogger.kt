package app.mumsmums.logging

import org.slf4j.Logger
import org.slf4j.LoggerFactory

inline fun <reified T> getLoggerByClass(): Logger =
    LoggerFactory.getLogger(T::class.java)

fun getLoggerByPackage(): Logger {
    // Create the callstack and figure out who called us; the first frame that's NOT
    // this package will be the package we want to use
    val callerClassName = Throwable().stackTrace
        .first { !it.className.startsWith(object{}::class.java.`package`.name) }
        .className
    return LoggerFactory.getLogger(callerClassName)
}
