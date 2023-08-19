package app.mumsmums.environment

import java.lang.IllegalStateException

object Environment {
    private val userDir = System.getProperty("user.dir")

    fun getPathToJs(): String {
        return if (userDir.contains("ubuntu")) {
             // when running on the EC2 instance
            "/home/ubuntu"
        } else if (userDir.contains("sthorsen")) {
            // when running on the work laptop
            "/Users/sthorsen/Snapchat/Dev/mumsmums/src/client/dist"
        } else if (userDir.contains("sofiethorsen")) {
            // when running on the personal laptop
            "/Users/sofiethorsen/development/mumsmums/src/client/dist"
        } else if (userDir == "/app") {
            // when running in a docker container
            return "/app"
        } else {
            throw IllegalStateException("Unknown userDir: $userDir")
        }
    }
}
