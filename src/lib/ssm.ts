import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({});

export async function getDatabaseURLFromSSM(){
    try {
        const command = new GetParameterCommand({
            Name: 'DATABASE_URL',
            WithDecryption: true,
        });
    
        const { Parameter } = await ssmClient.send(command);
        return Parameter?.Value
    } catch(err) {
        return process.env.DATABASE_URL;
    }
}