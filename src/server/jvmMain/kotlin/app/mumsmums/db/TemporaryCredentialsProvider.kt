package app.mumsmums.db

import com.amazonaws.auth.AWSCredentials
import com.amazonaws.auth.AWSCredentialsProvider
import com.amazonaws.auth.BasicSessionCredentials
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.sts.StsClient
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest

class TemporaryCredentialsProvider(
        private val roleArn: String,
        private val roleSessionName: String = "ScriptRole",
        private val region: Region = Region.EU_NORTH_1) : AWSCredentialsProvider {

    override fun getCredentials(): AWSCredentials {
        val credentialsProvider = DefaultCredentialsProvider.create()

        // Create an STS client using the default AWS credentials on the host machine
        val stsClient = StsClient.builder()
                .region(region)
                .credentialsProvider(credentialsProvider)
                .build()

        // Assume the specified role
        val assumeRoleRequest = AssumeRoleRequest.builder()
                .roleArn(roleArn)
                .roleSessionName(roleSessionName)
                .build()

        val assumedRole = stsClient.assumeRole(assumeRoleRequest)

        val temporaryCredentials = assumedRole.credentials()
        return BasicSessionCredentials(
                temporaryCredentials.accessKeyId(),
                temporaryCredentials.secretAccessKey(),
                temporaryCredentials.sessionToken()
        )
    }

    override fun refresh() {
        // NOOP: won't refresh a script session
    }
}
