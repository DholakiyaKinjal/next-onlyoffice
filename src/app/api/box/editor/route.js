import BoxSDK from "box-node-sdk";
import { NextResponse } from "next/server";
import path from "path";

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

export async function GET(request) {
  try {
    const fileId = request.nextUrl.searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required." },
        { status: 400 }
      );
    }

    // Get a publicly accessible shared link
    const fileInfo = await client.files.update(fileId, {
      shared_link: {
        access: "open", // Public access
        permissions: { can_download: true },
      },
    });

    if (!fileInfo.shared_link?.download_url) {
      return NextResponse.json(
        { error: "Could not generate download link." },
        { status: 500 }
      );
    }

    const fileType = path.extname(fileInfo.name).replace(".", "");

    return NextResponse.json({
      fileUrl: fileInfo.shared_link.download_url,
      fileType,
    });
  } catch (error) {
    console.error("Error generating shared link:", error);
    return NextResponse.json(
      { error: "Failed to generate file link.", details: error.message },
      { status: 500 }
    );
  }
}
