package app.mumsmums.db

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider
import software.amazon.awssdk.regions.Region

object DynamoClientFactory {
    private const val ADMIN_ROLE_ARN = "arn:aws:iam::487538579658:role/MumsmumsAdmin"

    fun getDynamoDbForScriptContext(region: Region = Region.EU_NORTH_1, roleSessionName: String = "ScriptRunner"): AmazonDynamoDB {
        val credentialsProvider = TemporaryCredentialsProvider(ADMIN_ROLE_ARN, roleSessionName, region)

        return AmazonDynamoDBClientBuilder.standard()
                .withRegion(region.id())
                .withCredentials(credentialsProvider)
                .build()
    }

    fun getDynamoDb(region: Region = Region.EU_NORTH_1): AmazonDynamoDB {
        val credentialsProvider = DefaultAWSCredentialsProviderChain.getInstance()

        return AmazonDynamoDBClientBuilder.standard()
                .withRegion(region.id())
                .withCredentials(credentialsProvider)
                .build()
    }
}
