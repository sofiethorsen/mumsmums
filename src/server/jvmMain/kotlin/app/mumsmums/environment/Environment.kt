package app.mumsmums.environment

object Environment {
    private val userDir = System.getProperty("user.dir")

    private fun isProd(): Boolean {
        return userDir.contains("ubuntu")
    }

    fun getPathToJs(): String {
        return if (isProd()) {
            "/home/ubuntu"
        } else {
            "/Users/sthorsen/Snapchat/Dev/mumsmums/src/client/dist"
        }
    }
}
