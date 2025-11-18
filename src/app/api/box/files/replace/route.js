import { NextResponse } from "next/server";
import BoxSDK from "box-node-sdk";
import { Readable } from "stream";

const sdk = new BoxSDK({
  clientID: "z3k4r0yygs0jf80i4o8hivsiu69ji78u",
  clientSecret: "vaeo6at3EKVFMRf9165EVJ9qWBIdaxvW",
  appAuth: {
    keyID: "f0t9oohm",
    privateKey:
      "-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIFHDBOBgkqhkiG9w0BBQ0wQTApBgkqhkiG9w0BBQwwHAQI9es0rc030V0CAggA\nMAwGCCqGSIb3DQIJBQAwFAYIKoZIhvcNAwcECDjRRrp3F9byBIIEyCmKr+5ra1V4\nOX3PsP1UABEkD2zUsYnjVfUbKk8yRRLGWiDSv5C++FZflczgvqXUb/S6JTkIJtHO\nJOMoqO8RwEBH8qoZUmIfdKyghHRJEMKYgeuBPqKahsqwVklUOxn+lyZXHxNu9Cnb\niu5qvFWZcJhOMxtS9tNVw3Ak4tqkj43Ld11k2gBZnnLENuohefsJs1/bMIqQBHta\n9t0ccTt9PFczq90GJG3Rdo9d9tUIP8G7Oz1QSYu13l9riG5LMQQMA1N0IpGIC3qc\nwGYLTguPA251fKSv87M1KHDJ4yVYgKs6TY+mYvnmpf1JgB0xVbQ4dgsmS/m3psKq\nuhTGzRk2kJga1bjatapJvwQcK0RcZBi1QTgHEtE7gzM1v5aWr/XXCaYToPPNbyAq\nu6DdeShovVnKsrOVhHkLVYOwMXO2RLu4yxaeKDhcAI2esCeLiPD+2FqcjYBLrhVq\nsQGY1Nn6GOvehF6YjpD4jirwb0z1IhDtohIPZal08ZLnxpCQXrBD71JH9ylDlsWR\nECc0AzcE19yfaS4/J5M4TZ2iMxi/ZPcI8JrT/VBNmGZWT8ZX6YrfVU3bh54i8OyX\nB8Y1dZOfbnqXtJy1bE7yjxGprw31iINOFLKuIeRXL+yIDCMnJEcrDf3uEh8YXY9X\niqOH5tLV5mWSBBhBDBd4TRMVz6IFuRqh5pexaZ5CydF0Ec7vCVgN+rSpqgr581ys\nD6nzKPmCKBzPStABLmeB312wFHyD/ECIjyz6SQvn5iX7viRLLcI5nfSu7qIwihYm\nVi9PwZQ853TqG8UgQ47/6wYoCRKOABfZ4kOsvBgoHlDzNK+IFYUM35tQrYUhrsB+\n0Pe5xBwAoB9a4HtJuHX1gkDGOKxcruRjaIcRPhC9igJzKpfBzY9Ar9A+uTBhxewG\n+krEU9mXtErsfQMk1Zupx8PSUdNODArQL51KuZ81pnz0XgyVWdALQp393+/cbbME\nCmag+DNxbGMU2/Ebx29q+iR1791RUeRM/wVYKXEtmR8lZA6AO/TG9fPhB7+avjZR\nHPkhyRKYkM7rRb9toQ1zeun4k447EwuC8457hiO6wPXO8T0MEhVe1hKwQJdZoUNr\nVWk2VAggL9HfwZF/7VSHo74KFSFo9pxj72V8BIS0+Agqk74sfVG5gnZQj/KcVqPj\nh5WGB1zqakyDBffw5xi9EAurqBzh7/M8B7jBquSd0cnlYLX+TRDHTbdsvmkbugyD\niin9VnF1oz6fp8Qozwivcy8vrtASocdvBYuqElyBeV+l7Fqt0+yongaKJ8Q/auih\nG3LLbNmSplm1qHMzlsYG3sRPgyKwaB7dUpLAChJupqXSFB4r7UtNAa+cFFscvN0n\nxAPmOFW0vIWBdW0OUQskkWQjBy0Mla0mNRMX5YCcBw9U7kUMvazKumzU3Q4aJykm\nElOEP/EKGRpv9NcF8nCV1ggo1MxKmunhYzX7CqyD8gzAtuupg0T4uHR4eoMjmzjK\njovK6IAbNcMx61mTRe2wtnWGmT2nz6Lnj3NNpCjFPG14uspxuOnE/wz2MQoNbJDP\npCZnFHwS8/mpr6JImLGn4ss0OU6UjAWMm6VC/VUl4MhYIQBbGgXxDczg1U0tLsm2\nUV5JP5ISH04Dq175rSiT9g==\n-----END ENCRYPTED PRIVATE KEY-----\n"?.replace(
        /\\n/g,
        "\n"
      ),
    passphrase: "bb729e7b44bb547ad401b5c0c64f5eae",
    enterpriseID: "1231873869",
  },
});

const client = sdk.getAppAuthClient("enterprise", "1231873869");

export async function POST(req) {
  try {
    // here userId is BoxUserId
    const accessToken = await client._session.getAccessToken();
    const newClient = sdk.getBasicClient(accessToken);

    const formData = await req.formData();
    const files = formData.getAll("file");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const boxFolderId = formData.get("boxFolderId") || "0";
    const email = formData.get("email") || "";
    const userId = formData.get("userId") || "";

    const uploadedFiles = [];

    const folderItems = await newClient.folders.getItems(boxFolderId, {
      fields: "id,name",
    });

    for (const file of files) {
      let existingFiles = await newClient.search.query(file.name, {
        ancestor_folder_ids: boxFolderId,
        type: "file",
      });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileStream = new Readable();
      fileStream.push(buffer);
      fileStream.push(null);

      const existingFile = folderItems.entries.find(
        (item) => item.name === file.name
      );
      if (existingFile) {
        // File already exists, replace it
        const existingFileId = existingFile.id;
        console.log(`Replacing existing file: ${file.name}`);

        const updatedFile = await newClient.files.uploadNewFileVersion(
          existingFileId,
          fileStream
        );
        uploadedFiles.push(updatedFile.entries[0]);
      } else {
        // File does not exist, upload as a new file
        console.log(`Uploading new file: ${file.name}`);

        const uploadedFileRes = await newClient.files.uploadFile(
          boxFolderId,
          file.name,
          fileStream,
          { description: email }
        );

        const uploadedFile = uploadedFileRes.entries[0];

        // await addCollaborator(uploadedFile.id, userId, "editor", "file");

        uploadedFiles.push(uploadedFile);
      }
    }

    return NextResponse.json({
      message: "Files replaced successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error replacing files:", error);
    return NextResponse.json(
      {
        error: error.response?.body.message,
        status: error.response?.statusCode || 500,
      },
      { status: error.response?.statusCode || 500 }
    );
  }
}
