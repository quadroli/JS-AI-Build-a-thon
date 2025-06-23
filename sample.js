import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import * as fs from "fs";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";


export async function main() {
  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: [
          { type: "text", text: "Write HTML and CSS code for a web page based on the hand-drawn sketch." },
          { type: "image_url", image_url: {
            url: getImageDataUrl("contoso_layout_sketch.jpg", "jpg"), details: "low" 
          }
          }
          ]
        }
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000,
      model: model
    }
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  console.log(response.body.choices[0].message.content);
}

function getImageDataUrl(imageFile, imageFormat){
  try{
    const imageBuffer = fs.readFileSync(imageFile);
    const imageBase64 = imageBuffer.toString('base64');
    return `data:image/${imageFormat};base64,${imageBase64}`;
  } catch {
    console.error(`Could not read '${imageFile}'.`);
    console.error('Set the correct path to the image file')
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});